import { execFile } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium } from 'playwright'
import type { BenchmarkTests } from './benchmarkTests.ts'
import { getAboutViewTests } from './aboutView.ts'
import { getActivityBarWorkerTests } from './activityBarWorker.ts'
import {
  aboutAllowedFailures,
  activityBarAllowedFailures,
  explorerAllowedFailures,
  titleBarAllowedFailures,
} from './allowedFailures.ts'
import { getExplorerViewTests } from './explorerView.ts'
import { prepareAboutViewServer } from './prepareAboutViewServer.ts'
import { prepareRendererMessageCapture } from './prepareRendererMessageCapture.ts'
import {
  getReceivedMessageJsonBytes,
  getReceivedRendererMessageTimings,
  getReceivedRendererMessages,
  getRendererCommandSummary,
  getVirtualDomMessageCalls,
  getVirtualDomMessageSummary,
} from './rendererMessages.ts'
import { startDetailedBenchmarkServer } from './serverProcess.ts'
import {
  getSummary,
  type RunSummary,
  waitForTestResults,
} from './testResults.ts'
import { getTitleBarWorkerTests } from './titleBarWorker.ts'

const execFileAsync = promisify(execFile)
const packageRoot = new URL('..', import.meta.url)
const outputRoot = new URL('dist/renderer-message-benchmark/', packageRoot)
const reportRoot = new URL('message-report/', packageRoot)
interface WorkloadOptions {
  readonly allowedFailures?: readonly string[]
  readonly getTests: () => Promise<BenchmarkTests>
  readonly prepare?: () => Promise<void>
}

interface WorkloadResult {
  readonly browserVersion: string
  readonly messages: {
    readonly received: number
    readonly receivedJsonBytes: number
    readonly receivedPath: string
    readonly rendererCommands: ReturnType<typeof getRendererCommandSummary>
    readonly timingsPath: string
    readonly virtualDom: ReturnType<typeof getVirtualDomMessageSummary>
    readonly virtualDomPath: string
  }
  readonly runError: string
  readonly serverVersion: string
  readonly summary: RunSummary
  readonly workload: Omit<BenchmarkTests, 'testPath'>
}

const workloads: readonly WorkloadOptions[] = [
  {
    allowedFailures: activityBarAllowedFailures,
    getTests: getActivityBarWorkerTests,
  },
  {
    allowedFailures: explorerAllowedFailures,
    getTests: getExplorerViewTests,
  },
  {
    allowedFailures: aboutAllowedFailures,
    getTests: getAboutViewTests,
    prepare: prepareAboutViewServer,
  },
  {
    allowedFailures: titleBarAllowedFailures,
    getTests: getTitleBarWorkerTests,
  },
]

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

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.stack || error.message : String(error)
}

const getGitValue = async (args: readonly string[]): Promise<string> => {
  try {
    const { stdout } = await execFileAsync('git', args)
    return stdout.trim()
  } catch {
    return 'unknown'
  }
}

const addRunError = (current: string, error: unknown): string => {
  const message = getErrorMessage(error)
  return current ? `${current}\n${message}` : message
}

const runWorkload = async (
  options: WorkloadOptions,
  timeout: number,
  filter: string | undefined,
): Promise<WorkloadResult> => {
  await options.prepare?.()
  const workload = await options.getTests()
  const server = await startDetailedBenchmarkServer(workload.testPath)
  const browser = await chromium.launch({ headless: true })
  const browserVersion = browser.version()
  const context = await browser.newContext({
    viewport: { height: 900, width: 1440 },
  })
  const page = await context.newPage()
  let results: Awaited<ReturnType<typeof waitForTestResults>> = []
  let runError = ''
  let receivedMessages: Awaited<
    ReturnType<typeof getReceivedRendererMessages>
  > = []
  let receivedMessageTimings: Awaited<
    ReturnType<typeof getReceivedRendererMessageTimings>
  > = []
  try {
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error(`[browser] ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      console.error(`[browser] ${error.stack ?? error.message}`)
    })
    const url = new URL('/tests/_all.html', server.url)
    if (filter) {
      url.searchParams.set('filter', filter)
    }
    process.stdout.write(
      `Running ${workload.id} tests with renderer message capture at ${url.href}\n`,
    )
    try {
      await page.goto(url.href, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      })
      results = await waitForTestResults(page, timeout, workload)
    } catch (error) {
      runError = addRunError(runError, error)
    }
    try {
      receivedMessages = await getReceivedRendererMessages(page)
      receivedMessageTimings = await getReceivedRendererMessageTimings(page)
    } catch (error) {
      runError = addRunError(runError, error)
    }
  } finally {
    await browser.close()
    await server.close()
  }

  const virtualDomCalls = getVirtualDomMessageCalls(receivedMessages)
  const receivedPath = `./messages/${workload.id}.json`
  const timingsPath = `./message-timings/${workload.id}.json`
  const virtualDomPath = `./virtual-dom-messages/${workload.id}.json`
  await writeFile(
    new URL(receivedPath, outputRoot),
    `${JSON.stringify(receivedMessages, null, 2)}\n`,
  )
  await writeFile(
    new URL(timingsPath, outputRoot),
    `${JSON.stringify(receivedMessageTimings, null, 2)}\n`,
  )
  await writeFile(
    new URL(virtualDomPath, outputRoot),
    `${JSON.stringify(virtualDomCalls, null, 2)}\n`,
  )
  return {
    browserVersion,
    messages: {
      received: receivedMessages.length,
      receivedJsonBytes: getReceivedMessageJsonBytes(receivedMessages),
      receivedPath,
      rendererCommands: getRendererCommandSummary(
        receivedMessages,
        receivedMessageTimings,
      ),
      timingsPath,
      virtualDom: getVirtualDomMessageSummary(virtualDomCalls),
      virtualDomPath,
    },
    runError,
    serverVersion: server.version,
    summary: getSummary(results, new Set(options.allowedFailures)),
    workload: {
      commit: workload.commit,
      id: workload.id,
      label: workload.label,
      source: workload.source,
    },
  }
}

const run = async (): Promise<void> => {
  const timeout = readPositiveInteger(
    'RENDERER_MESSAGE_BENCHMARK_TIMEOUT_MS',
    30 * 60 * 1000,
  )
  const filter = process.env.RENDERER_MESSAGE_BENCHMARK_FILTER
  await rm(outputRoot, { force: true, recursive: true })
  await mkdir(new URL('messages/', outputRoot), { recursive: true })
  await mkdir(new URL('message-timings/', outputRoot), { recursive: true })
  await mkdir(new URL('virtual-dom-messages/', outputRoot), { recursive: true })
  await prepareRendererMessageCapture()

  const results: WorkloadResult[] = []
  for (const options of workloads) {
    results.push(await runWorkload(options, timeout, filter))
  }

  const total = {
    jsonBytes: 0,
    received: 0,
    receivedJsonBytes: 0,
    rendererCommands: 0,
    virtualDom: 0,
  }
  for (const result of results) {
    total.jsonBytes += result.messages.virtualDom.jsonBytes
    total.received += result.messages.received
    total.receivedJsonBytes += result.messages.receivedJsonBytes
    total.rendererCommands += result.messages.rendererCommands.count
    total.virtualDom += result.messages.virtualDom.count
  }
  const cpu = cpus()[0]
  const report = {
    branch: await getGitValue(['rev-parse', '--abbrev-ref', 'HEAD']),
    commit: await getGitValue(['rev-parse', 'HEAD']),
    config: {
      ...(filter && { filter }),
      reusePage: true,
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
    measurement: {
      encoding: 'utf8',
      format: 'json',
      unit: 'bytes',
    },
    repository: 'lvce-editor/virtual-dom',
    schemaVersion: 2,
    title: 'LVCE Virtual DOM renderer message benchmark',
    total,
    workloads: results,
  }
  await cp(reportRoot, outputRoot, { recursive: true })
  await writeFile(
    new URL('benchmark-results.json', outputRoot),
    `${JSON.stringify(report, null, 2)}\n`,
  )
  process.stdout.write(
    `Renderer message benchmark written to ${fileURLToPath(outputRoot)}\n`,
  )

  const errors = results.flatMap((result) => {
    const workloadErrors: string[] = []
    if (result.runError) {
      workloadErrors.push(`${result.workload.label}: ${result.runError}`)
    }
    if (result.summary.unexpectedFailed > 0) {
      workloadErrors.push(
        `${result.workload.label}: ${result.summary.unexpectedFailed} unexpected e2e tests failed`,
      )
    }
    return workloadErrors
  })
  if (errors.length > 0) {
    throw new Error(`Renderer message benchmark failed:\n${errors.join('\n')}`)
  }
}

await run()
