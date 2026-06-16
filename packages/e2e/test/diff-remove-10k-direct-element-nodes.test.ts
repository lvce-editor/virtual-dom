import { test, expect } from '../src/fixtures.ts'

test.setTimeout(60_000)

test('diff - remove 10k direct element nodes', async ({ page }) => {
  await page.goto('/diff/large-dom-changes.html#remove-direct-element-nodes')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomLargeDiffResult
  })

  expect(result.childNodeCount).toBe(0)
  expect(result.childElementCount).toBe(0)
  expect(result.textContentLength).toBe(0)
})
