import type { Page } from 'playwright'
import type { BenchmarkTests } from './benchmarkTests.ts'

export interface TestResult {
  readonly duration: number
  readonly end: number
  readonly error: string
  readonly name: string
  readonly start: number
  readonly status: 'fail' | 'pass' | 'skip'
}

export interface RunSummary {
  readonly allowedFailed: number
  readonly duration: number
  readonly failed: number
  readonly passed: number
  readonly skipped: number
  readonly total: number
  readonly unexpectedFailed: number
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

export const waitForTestResults = async (
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

export const getSummary = (
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
