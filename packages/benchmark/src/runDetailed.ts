import { execFile } from 'node:child_process'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium, type BrowserContext, type Page } from 'playwright'
import { startCpuProfile, type CpuProfileCaptureResult } from './cpuProfile.ts'
import { getExplorerViewTests } from './explorerView.ts'
import { startDetailedBenchmarkServer } from './serverProcess.ts'

const execFileAsync = promisify(execFile)
const packageRoot = new URL('..', import.meta.url)
const reportRoot = new URL('detailed-report/', packageRoot)
const outputRoot = new URL('dist/detailed-benchmark/', packageRoot)
const profilesPath = fileURLToPath(new URL('profiles/', outputRoot))
const browserProfilePath = fileURLToPath(
  new URL('.tmp/chromium-profile/', packageRoot),
)

interface TestResult {
  readonly duration: number
  readonly end: number
  readonly error: string
  readonly name: string
  readonly start: number
  readonly status: 'fail' | 'pass' | 'skip'
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
    throw new Error('Explorer e2e test results are empty')
  }
  const parsed = JSON.parse(text) as unknown
  if (!Array.isArray(parsed)) {
    throw new TypeError('Expected explorer e2e test results to be an array')
  }
  return parsed.map(parseTestResult)
}

const closeBrowser = async (
  context: BrowserContext | undefined,
): Promise<void> => {
  if (context) {
    await context.close()
  }
}

const getDevToolsWebSocketUrl = async (): Promise<string> => {
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

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.stack || error.message : String(error)
}

const main = async (): Promise<void> => {
  const timeout = readPositiveInteger(
    'DETAILED_BENCHMARK_TIMEOUT_MS',
    30 * 60 * 1000,
  )
  const filter = process.env.DETAILED_BENCHMARK_FILTER
  const samplingInterval = readPositiveInteger(
    'DETAILED_BENCHMARK_SAMPLING_INTERVAL_US',
    1000,
  )
  const explorerView = await getExplorerViewTests()
  await rm(outputRoot, { force: true, recursive: true })
  await rm(browserProfilePath, { force: true, recursive: true })
  await mkdir(outputRoot, { recursive: true })
  await mkdir(browserProfilePath, { recursive: true })

  process.stdout.write('Starting @lvce-editor/server...\n')
  const server = await startDetailedBenchmarkServer(explorerView.testPath)
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

    process.stdout.write('Starting browser-wide V8 CPU profile...\n')
    const capture = await startCpuProfile({
      outputPath: profilesPath,
      samplingInterval,
      webSocketUrl: await getDevToolsWebSocketUrl(),
    })
    try {
      const url = new URL('/tests/_all.html', server.url)
      if (filter) {
        url.searchParams.set('filter', filter)
      }
      process.stdout.write(`Running explorer-view tests at ${url.href}\n`)
      await page.goto(url.href, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      })
      results = await waitForTestResults(page, timeout)
      userAgent = await page.evaluate(() => globalThis.navigator.userAgent)
    } catch (error) {
      runError = getErrorMessage(error)
    } finally {
      process.stdout.write('Stopping and downloading CPU profile...\n')
      captureResult = await capture.stop()
    }
  } finally {
    await closeBrowser(context)
    await server.close()
    await rm(browserProfilePath, { force: true, recursive: true })
  }

  if (!captureResult) {
    throw new Error('Chrome CPU profiles were not captured')
  }
  const { analysis } = captureResult
  const passed = results.filter((result) => result.status === 'pass').length
  const failed = results.filter((result) => result.status === 'fail').length
  const skipped = results.filter((result) => result.status === 'skip').length
  const duration = results.reduce((total, result) => total + result.duration, 0)
  const commit = await getGitValue(['rev-parse', 'HEAD'])
  const branch = await getGitValue(['rev-parse', '--abbrev-ref', 'HEAD'])
  const cpu = cpus()[0]
  const report = {
    analysis,
    branch,
    browser: {
      name: 'Chromium',
      userAgent,
      version: browserVersion ?? 'unknown',
    },
    commit,
    config: {
      ...(filter && { filter }),
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
    explorerView: {
      commit: explorerView.commit,
      source: explorerView.source,
    },
    generatedAt: new Date().toISOString(),
    profiles: captureResult.profiles,
    repository: 'lvce-editor/virtual-dom',
    runError,
    schemaVersion: 1,
    serverVersion: server.version,
    summary: {
      duration: Math.round(duration * 1000) / 1000,
      failed,
      passed,
      skipped,
      total: results.length,
    },
    tests: results.toSorted((left, right) => right.duration - left.duration),
    title: 'LVCE Virtual DOM detailed benchmark',
    capture: {
      detachedTargetCount: captureResult.detachedTargetCount,
    },
  }

  await cp(reportRoot, outputRoot, { recursive: true })
  await writeFile(
    new URL('benchmark-results.json', outputRoot),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  process.stdout.write(
    `Detailed benchmark written to ${fileURLToPath(outputRoot)}\n`,
  )

  if (runError) {
    throw new Error(`Explorer benchmark failed: ${runError}`)
  }
  if (failed > 0) {
    throw new Error(`${failed} explorer-view e2e tests failed`)
  }
}

await main()
