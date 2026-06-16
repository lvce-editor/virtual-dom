import { test, expect } from '../src/fixtures.ts'

test.setTimeout(60_000)

test('diff - add 10k direct element nodes', async ({ page }) => {
  await page.goto('/diff/large-dom-changes.html#add-direct-element-nodes')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomLargeDiffResult
  })

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(10_000)
  expect(result.firstElementClassName).toBe('item-0')
  expect(result.lastElementClassName).toBe('item-9999')
})
