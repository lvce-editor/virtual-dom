import { test, expect } from '../src/fixtures.ts'

test.setTimeout(60_000)

test('diff - add 10k adjacent text nodes', async ({ page }) => {
  await page.goto('/diff/large-dom-changes.html#add-text-nodes')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomLargeDiffResult
  })

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(0)
  expect(result.firstNodeValue).toBe('text-0;')
  expect(result.lastNodeValue).toBe('text-9999;')
  expect(result.textContentLength).toBe(98_890)
})
