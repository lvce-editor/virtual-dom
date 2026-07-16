import { execFile } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium, type BrowserContext, type Page } from 'playwright'
import type { BenchmarkTests } from './benchmarkTests.ts'
import { startCpuProfile, type CpuProfileCaptureResult } from './cpuProfile.ts'
import { startDetailedBenchmarkServer } from './serverProcess.ts'
import { getStatistics } from './statistics.ts'

const execFileAsync = promisify(execFile)
const packageRoot = new URL('..', import.meta.url)
const reportRoot = new URL('detailed-report/', packageRoot)

interface DetailedBenchmarkOptions {
  readonly allowedFailures?: readonly string[]
  readonly getTests: () => Promise<BenchmarkTests>
  readonly outputPath: string
}

interface TestResult {
  readonly duration: number
  readonly end: number
  readonly error: string
  readonly name: string
  readonly start: number
  readonly status: 'fail' | 'pass' | 'skip'
}

interface RunSummary {
  readonly allowedFailed: number
  readonly duration: number
  readonly failed: number
  readonly passed: number
  readonly skipped: number
  readonly total: number
  readonly unexpectedFailed: number
}

interface DetailedBenchmarkRun {
  readonly analysis: CpuProfileCaptureResult['analysis']
  readonly browserVersion: string
  readonly capture: {
    readonly detachedTargetCount: number
  }
  readonly index: number
  readonly profiles: CpuProfileCaptureResult['profiles']
  readonly profilesPath: string
  readonly runError: string
  readonly summary: RunSummary
  readonly tests: readonly TestResult[]
  readonly userAgent: string
  readonly virtualDomShare: number
}

const readPositiveInteger = (name: string, fallback: number): number => {
  const value = process.env[name]
  if (!value) {
    return fallback
  }
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer`)
  }
  return parsed
}

const getGitValue = async (args: readonly string[]): Promise<string> => {
  try {
    const { stdout } = await execFileAsync('git', args)
    return stdout.trim()
  } catch {
    return 'unknown'
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const parseString = (value: unknown, field: string): string => {
  if (typeof value !== 'string') {
    throw new TypeError(`Expected ${field} to be a string`)
  }
  return value
}

const parseNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Expected ${field} to be a finite number`)
  }
  return value
}

const parseStatus = (value: unknown): TestResult['status'] => {
  const statuses: readonly TestResult['status'][] = ['fail', 'pass', 'skip']
  if (
    typeof value === 'string' &&
    statuses.includes(value as TestResult['status'])
  ) {
    return value as TestResult['status']
  }
  throw new TypeError('Expected test status to be fail, pass, or skip')
}

const parseTestResult = (value: unknown): TestResult => {
  if (!isRecord(value)) {
    throw new TypeError('Expected test result to be an object')
  }
  const start = parseNumber(value.start, 'test start')
  const end = parseNumber(value.end, 'test end')
  return {
    duration: Math.round((end - start) * 1000) / 1000,
    end,
    error: value.error === undefined ? '' : parseString(value.error, 'error'),
    name: parseString(value.name, 'test name'),
    start,
    status: parseStatus(value.status),
  }
}

const waitForTestResults = async (
  page: Page,
  timeout: number,
  workload: BenchmarkTests,
): Promise<readonly TestResult[]> => {
  const selector = '.TestResults'
  await page.locator(selector).waitFor({ state: 'attached', timeout })
  await page.waitForFunction(
    (value) => {
      const text = document.querySelector(value)?.textContent
      return typeof text === 'string' && text.trim().length > 0
    },
    selector,
    { timeout },
  )
  const text = await page.locator(selector).textContent()
  if (!text) {
    throw new Error(`${workload.label} e2e test results are empty`)
  }
  const parsed = JSON.parse(text) as unknown
  if (!Array.isArray(parsed)) {
    throw new TypeError(
      `Expected ${workload.label} e2e test results to be an array`,
    )
  }
  return parsed.map(parseTestResult)
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.stack || error.message : String(error)
}

const closeBrowser = async (
  context: BrowserContext | undefined,
): Promise<void> => {
  if (context) {
    await context.close()
  }
}

const getDevToolsWebSocketUrl = async (
  browserProfilePath: string,
): Promise<string> => {
  const content = await readFile(
    join(browserProfilePath, 'DevToolsActivePort'),
    'utf8',
  )
  const [port, path] = content.trim().split('\n')
  if (!port || !path) {
    throw new Error('Chrome did not write a valid DevToolsActivePort file')
  }
  return `ws://127.0.0.1:${port}${path}`
}

const getSummary = (
  results: readonly TestResult[],
  allowedFailures: ReadonlySet<string>,
): RunSummary => {
  const failedResults = results.filter((result) => result.status === 'fail')
  const allowedFailed = failedResults.filter((result) =>
    allowedFailures.has(result.name),
  ).length
  const duration = results.reduce((total, result) => total + result.duration, 0)
  return {
    allowedFailed,
    duration: Math.round(duration * 1000) / 1000,
    failed: failedResults.length,
    passed: results.filter((result) => result.status === 'pass').length,
    skipped: results.filter((result) => result.status === 'skip').length,
    total: results.length,
    unexpectedFailed: failedResults.length - allowedFailed,
  }
}

const runBenchmarkOnce = async ({
  allowedFailures,
  browserProfilePath,
  filter,
  index,
  outputPath,
  samplingInterval,
  serverUrl,
  timeout,
  workload,
}: {
  readonly allowedFailures: ReadonlySet<string>
  readonly browserProfilePath: string
  readonly filter: string | undefined
  readonly index: number
  readonly outputPath: string
  readonly samplingInterval: number
  readonly serverUrl: string
  readonly timeout: number
  readonly workload: BenchmarkTests
}): Promise<DetailedBenchmarkRun> => {
  await rm(browserProfilePath, { force: true, recursive: true })
  await rm(outputPath, { force: true, recursive: true })
  await mkdir(browserProfilePath, { recursive: true })
  await mkdir(outputPath, { recursive: true })
  let context: BrowserContext | undefined
  let captureResult: CpuProfileCaptureResult | undefined
  let results: readonly TestResult[] = []
  let userAgent = 'unknown'
  let browserVersion: string | undefined
  let runError = ''

  try {
    context = await chromium.launchPersistentContext(browserProfilePath, {
      args: ['--remote-debugging-port=0'],
      headless: true,
      viewport: { height: 900, width: 1440 },
    })
    browserVersion = context.browser()?.version() ?? 'unknown'
    const page = context.pages()[0] ?? (await context.newPage())
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error(`[browser] ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      console.error(`[browser] ${error.stack ?? error.message}`)
    })

    process.stdout.write(
      `Run ${index}: starting browser-wide V8 CPU profile...\n`,
    )
    const capture = await startCpuProfile({
      outputPath,
      samplingInterval,
      webSocketUrl: await getDevToolsWebSocketUrl(browserProfilePath),
    })
    try {
      const url = new URL('/tests/_all.html', serverUrl)
      if (filter) {
        url.searchParams.set('filter', filter)
      }
      process.stdout.write(
        `Run ${index}: running ${workload.id} tests with --reuse-page at ${url.href}\n`,
      )
      await page.goto(url.href, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      })
      results = await waitForTestResults(page, timeout, workload)
      userAgent = await page.evaluate(() => globalThis.navigator.userAgent)
    } catch (error) {
      runError = getErrorMessage(error)
    } finally {
      process.stdout.write(
        `Run ${index}: stopping and downloading CPU profile...\n`,
      )
      captureResult = await capture.stop()
    }
  } finally {
    await closeBrowser(context)
    await rm(browserProfilePath, { force: true, recursive: true })
  }

  if (!captureResult) {
    throw new Error(`Chrome CPU profiles were not captured for run ${index}`)
  }
  const { analysis } = captureResult
  return {
    analysis,
    browserVersion: browserVersion ?? 'unknown',
    capture: {
      detachedTargetCount: captureResult.detachedTargetCount,
    },
    index,
    profiles: captureResult.profiles,
    profilesPath: outputPath,
    runError,
    summary: getSummary(results, allowedFailures),
    tests: results.toSorted((left, right) => right.duration - left.duration),
    userAgent,
    virtualDomShare:
      analysis.totalProfiledMs === 0
        ? 0
        : analysis.virtualDomInclusiveMs / analysis.totalProfiledMs,
  }
}

const selectRepresentativeRun = (
  runs: readonly DetailedBenchmarkRun[],
): DetailedBenchmarkRun => {
  const sorted = runs.toSorted(
    (left, right) => left.virtualDomShare - right.virtualDomShare,
  )
  const selected = sorted[Math.floor(sorted.length / 2)]
  if (!selected) {
    throw new Error('At least one detailed benchmark run is required')
  }
  return selected
}

export const runDetailedBenchmark = async (
  options: DetailedBenchmarkOptions,
): Promise<void> => {
  const outputRoot = new URL(`dist/${options.outputPath}/`, packageRoot)
  const profilesPath = fileURLToPath(new URL('profiles/', outputRoot))
  const temporaryRoot = fileURLToPath(
    new URL(`.tmp/detailed-benchmark/${options.outputPath}/`, packageRoot),
  )
  const timeout = readPositiveInteger(
    'DETAILED_BENCHMARK_TIMEOUT_MS',
    30 * 60 * 1000,
  )
  const filter = process.env.DETAILED_BENCHMARK_FILTER
  const samplingInterval = readPositiveInteger(
    'DETAILED_BENCHMARK_SAMPLING_INTERVAL_US',
    1000,
  )
  const repeats = readPositiveInteger('DETAILED_BENCHMARK_REPEATS', 5)
  const workload = await options.getTests()
  const allowedFailures = new Set(options.allowedFailures)
  await rm(outputRoot, { force: true, recursive: true })
  await rm(temporaryRoot, { force: true, recursive: true })
  await mkdir(outputRoot, { recursive: true })
  await mkdir(temporaryRoot, { recursive: true })

  process.stdout.write('Starting @lvce-editor/server...\n')
  const server = await startDetailedBenchmarkServer(workload.testPath)
  const runs: DetailedBenchmarkRun[] = []
  try {
    for (let index = 1; index <= repeats; index++) {
      runs.push(
        await runBenchmarkOnce({
          allowedFailures,
          browserProfilePath: join(temporaryRoot, `browser-${index}`),
          filter,
          index,
          outputPath: join(temporaryRoot, `profiles-${index}`),
          samplingInterval,
          serverUrl: server.url,
          timeout,
          workload,
        }),
      )
    }
  } finally {
    await server.close()
  }

  const representativeRun = selectRepresentativeRun(runs)
  const virtualDomPercentStatistics = getStatistics(
    runs.map((run) => run.virtualDomShare * 100),
  )
  const durationStatistics = getStatistics(
    runs.map((run) => run.summary.duration),
  )
  const commit = await getGitValue(['rev-parse', 'HEAD'])
  const branch = await getGitValue(['rev-parse', '--abbrev-ref', 'HEAD'])
  const cpu = cpus()[0]
  const report = {
    analysis: representativeRun.analysis,
    branch,
    browser: {
      name: 'Chromium',
      userAgent: representativeRun.userAgent,
      version: representativeRun.browserVersion,
    },
    capture: representativeRun.capture,
    commit,
    config: {
      ...(options.allowedFailures && {
        allowedFailures: options.allowedFailures,
      }),
      ...(filter && { filter }),
      repeats,
      reusePage: true,
      samplingInterval,
      timeout,
    },
    environment: {
      arch: process.arch,
      cpu: cpu?.model ?? 'unknown',
      cpuCount: cpus().length,
      node: process.version,
      platform: process.platform,
    },
    generatedAt: new Date().toISOString(),
    profiles: representativeRun.profiles,
    repeatStatistics: {
      durationMs: durationStatistics,
      virtualDomPercent: virtualDomPercentStatistics,
    },
    representativeRun: representativeRun.index,
    repository: 'lvce-editor/virtual-dom',
    runError: representativeRun.runError,
    runs: runs.map((run) => ({
      analysis: {
        profileCount: run.analysis.profileCount,
        sampleCount: run.analysis.sampleCount,
        totalProfiledMs: run.analysis.totalProfiledMs,
        virtualDomInclusiveMs: run.analysis.virtualDomInclusiveMs,
        virtualDomSelfMs: run.analysis.virtualDomSelfMs,
      },
      capture: run.capture,
      index: run.index,
      runError: run.runError,
      summary: run.summary,
      virtualDomShare: run.virtualDomShare,
    })),
    schemaVersion: 3,
    serverVersion: server.version,
    summary: representativeRun.summary,
    tests: representativeRun.tests,
    title: `LVCE Virtual DOM ${workload.label.toLowerCase()} benchmark`,
    workload: {
      commit: workload.commit,
      id: workload.id,
      label: workload.label,
      source: workload.source,
    },
  }

  await cp(reportRoot, outputRoot, { recursive: true })
  await cp(representativeRun.profilesPath, profilesPath, { recursive: true })
  await writeFile(
    new URL('benchmark-results.json', outputRoot),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  await rm(temporaryRoot, { force: true, recursive: true })
  process.stdout.write(
    `Detailed benchmark written to ${fileURLToPath(outputRoot)}\n`,
  )

  const errors = runs
    .filter((run) => run.runError)
    .map((run) => `run ${run.index}: ${run.runError}`)
  if (errors.length > 0) {
    throw new Error(`${workload.label} benchmark failed:\n${errors.join('\n')}`)
  }
  const unexpectedFailed = runs.reduce(
    (total, run) => total + run.summary.unexpectedFailed,
    0,
  )
  if (unexpectedFailed > 0) {
    throw new Error(
      `${unexpectedFailed} unexpected ${workload.id} e2e tests failed across all runs`,
    )
  }
}
