import { execFile } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium, type Page } from 'playwright'
import { startServer } from './server.ts'
import { getStatistics, type Statistics } from './statistics.ts'

const execFileAsync = promisify(execFile)
const packageRoot = new URL('..', import.meta.url)
const reportRoot = new URL('report/', packageRoot)
const outputRoot = new URL('dist/', packageRoot)

interface Scenario {
  readonly description: string
  readonly id: string
  readonly name: string
}

interface ScenarioRun extends Statistics {
  readonly samples: readonly number[]
}

const scenarios: readonly Scenario[] = [
  {
    id: 'create-1k',
    name: 'Create 1,000 rows',
    description: 'Create a populated table from an empty state.',
  },
  {
    id: 'replace-1k',
    name: 'Replace all 1,000 rows',
    description: 'Replace every row with newly generated data.',
  },
  {
    id: 'partial-update',
    name: 'Partial update',
    description: 'Update the label of every 10th row.',
  },
  {
    id: 'select-row',
    name: 'Select row',
    description: 'Highlight the second row in a 1,000 row table.',
  },
  {
    id: 'swap-rows',
    name: 'Swap rows',
    description: 'Swap the second and 999th rows.',
  },
  {
    id: 'remove-row',
    name: 'Remove row',
    description: 'Remove the second row from a 1,000 row table.',
  },
  {
    id: 'create-10k',
    name: 'Create 10,000 rows',
    description: 'Create a large table from an empty state.',
  },
  {
    id: 'append-1k',
    name: 'Append 1,000 rows',
    description: 'Append 1,000 rows to an existing 1,000 row table.',
  },
  {
    id: 'clear-1k',
    name: 'Clear 1,000 rows',
    description: 'Remove every row from a populated table.',
  },
  {
    id: 'set-props-10k',
    name: 'Set props on 10,000 elements',
    description:
      'Apply representative virtual DOM properties to pre-created elements.',
  },
  {
    id: 'create-elements-10k',
    name: 'Create 10,000 DOM elements',
    description: 'Create and retain detached native DOM elements.',
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

const getGitValue = async (args: readonly string[]): Promise<string> => {
  try {
    const { stdout } = await execFileAsync('git', args)
    return stdout.trim()
  } catch {
    return 'unknown'
  }
}

const waitForAnimationFrame = async (page: Page): Promise<void> => {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      globalThis.requestAnimationFrame(() => resolve())
    })
  })
}

const resetScenario = async (page: Page, id: string): Promise<void> => {
  await page.evaluate((scenarioId) => {
    globalThis.virtualDomBenchmark.reset(scenarioId)
  }, id)
}

const runScenario = async (page: Page, id: string): Promise<number> => {
  return page.evaluate((scenarioId) => {
    return globalThis.virtualDomBenchmark.run(scenarioId)
  }, id)
}

const round = (value: number): number => {
  return Math.round(value * 1000) / 1000
}

const runBenchmark = async ({
  iterations,
  repeat,
  serverUrl,
  warmupIterations,
}: {
  readonly iterations: number
  readonly repeat: number
  readonly serverUrl: string
  readonly warmupIterations: number
}): Promise<{
  readonly browserVersion: string
  readonly results: ReadonlyMap<string, ScenarioRun>
  readonly userAgent: string
}> => {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { height: 900, width: 1440 },
  })
  try {
    const page = await context.newPage()
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error(`[browser] ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      console.error(`[browser] ${error.stack ?? error.message}`)
    })

    const results = new Map<string, ScenarioRun>()
    for (const scenario of scenarios) {
      process.stdout.write(`Run ${repeat}: benchmarking ${scenario.name}... `)
      await page.goto(serverUrl, { waitUntil: 'networkidle' })
      await page.waitForFunction(() => {
        return typeof globalThis.virtualDomBenchmark?.run === 'function'
      })

      for (let index = 0; index < warmupIterations; index++) {
        await resetScenario(page, scenario.id)
        await runScenario(page, scenario.id)
        await waitForAnimationFrame(page)
      }

      const samples: number[] = []
      for (let index = 0; index < iterations; index++) {
        await resetScenario(page, scenario.id)
        samples.push(await runScenario(page, scenario.id))
        await waitForAnimationFrame(page)
      }

      const statistics = getStatistics(samples)
      results.set(scenario.id, {
        ...statistics,
        samples: samples.map(round),
      })
      process.stdout.write(`${statistics.median.toFixed(2)} ms median\n`)
    }

    const userAgent = await page.evaluate(() => globalThis.navigator.userAgent)
    return {
      browserVersion: browser.version(),
      results,
      userAgent,
    }
  } finally {
    await context.close()
    await browser.close()
  }
}

declare global {
  var virtualDomBenchmark: {
    reset: (id: string) => void
    run: (id: string) => number
  }
}

const main = async (): Promise<void> => {
  const iterations = readPositiveInteger('BENCHMARK_ITERATIONS', 10)
  const repeats = readPositiveInteger('BENCHMARK_REPEATS', 5)
  const warmupIterations = readPositiveInteger('BENCHMARK_WARMUP_ITERATIONS', 3)
  const server = await startServer()

  try {
    const runs: ReadonlyMap<string, ScenarioRun>[] = []
    let browserVersion = 'unknown'
    let userAgent = 'unknown'
    for (let repeat = 1; repeat <= repeats; repeat++) {
      const {
        browserVersion: runBrowserVersion,
        results,
        userAgent: runUserAgent,
      } = await runBenchmark({
        iterations,
        repeat,
        serverUrl: server.url,
        warmupIterations,
      })
      runs.push(results)
      browserVersion = runBrowserVersion
      userAgent = runUserAgent
    }

    const results = scenarios.map((scenario) => {
      const scenarioRuns = runs.map((run) => {
        const result = run.get(scenario.id)
        if (!result) {
          throw new Error(`Missing benchmark result for ${scenario.id}`)
        }
        return result
      })
      const repeatMedians = scenarioRuns.map((run) => run.median)
      return {
        ...scenario,
        ...getStatistics(repeatMedians),
        repeatMedians,
        runs: scenarioRuns,
        samples: repeatMedians,
        unit: 'ms',
      }
    })

    const commit = await getGitValue(['rev-parse', 'HEAD'])
    const branch = await getGitValue(['rev-parse', '--abbrev-ref', 'HEAD'])
    const cpu = cpus()[0]
    const report = {
      schemaVersion: 2,
      title: 'LVCE Virtual DOM benchmark',
      generatedAt: new Date().toISOString(),
      repository: 'lvce-editor/virtual-dom',
      commit,
      branch,
      browser: {
        name: 'Chromium',
        version: browserVersion,
        userAgent,
      },
      environment: {
        arch: process.arch,
        cpu: cpu?.model ?? 'unknown',
        cpuCount: cpus().length,
        node: process.version,
        platform: process.platform,
      },
      config: {
        iterations,
        repeats,
        warmupIterations,
      },
      results,
    }

    await rm(outputRoot, { force: true, recursive: true })
    await mkdir(outputRoot, { recursive: true })
    await cp(reportRoot, outputRoot, { recursive: true })
    await writeFile(
      new URL('benchmark-results.json', outputRoot),
      `${JSON.stringify(report, null, 2)}\n`,
    )
    process.stdout.write(
      `Static report written to ${fileURLToPath(outputRoot)}\n`,
    )
  } finally {
    await server.close()
  }
}

await main()
