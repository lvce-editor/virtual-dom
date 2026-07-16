import { execFile } from 'node:child_process'
import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { chromium, type Page } from 'playwright'
import { startServer } from './server.ts'
import { getStatistics } from './statistics.ts'

const execFileAsync = promisify(execFile)
const packageRoot = new URL('..', import.meta.url)
const reportRoot = new URL('report/', packageRoot)
const outputRoot = new URL('dist/', packageRoot)

interface Scenario {
  readonly description: string
  readonly id: string
  readonly name: string
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

declare global {
  var virtualDomBenchmark: {
    reset: (id: string) => void
    run: (id: string) => number
  }
}

const main = async (): Promise<void> => {
  const iterations = readPositiveInteger('BENCHMARK_ITERATIONS', 10)
  const warmupIterations = readPositiveInteger('BENCHMARK_WARMUP_ITERATIONS', 3)
  const server = await startServer()
  const browser = await chromium.launch({ headless: true })

  try {
    const context = await browser.newContext({
      viewport: { height: 900, width: 1440 },
    })
    const page = await context.newPage()
    page.on('console', (message) => {
      if (message.type() === 'error') {
        console.error(`[browser] ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      console.error(`[browser] ${error.stack ?? error.message}`)
    })

    const results = []
    for (const scenario of scenarios) {
      process.stdout.write(`Benchmarking ${scenario.name}... `)
      await page.goto(server.url, { waitUntil: 'networkidle' })
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
      results.push({
        ...scenario,
        ...statistics,
        samples: samples.map((sample) => Math.round(sample * 1000) / 1000),
        unit: 'ms',
      })
      process.stdout.write(`${statistics.median.toFixed(2)} ms median\n`)
    }

    const userAgent = await page.evaluate(() => globalThis.navigator.userAgent)
    const commit = await getGitValue(['rev-parse', 'HEAD'])
    const branch = await getGitValue(['rev-parse', '--abbrev-ref', 'HEAD'])
    const cpu = cpus()[0]
    const report = {
      schemaVersion: 1,
      title: 'LVCE Virtual DOM benchmark',
      generatedAt: new Date().toISOString(),
      repository: 'lvce-editor/virtual-dom',
      commit,
      branch,
      browser: {
        name: 'Chromium',
        version: browser.version(),
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
    await browser.close()
    await server.close()
  }
}

await main()
