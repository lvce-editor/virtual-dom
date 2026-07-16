import { test, expect } from '../src/fixtures.ts'

test('diff - exposes additional browser event arguments', async ({ page }) => {
  await page.goto('/diff/event-argument-coverage.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomEventArgumentCoverageResult
  })

  expect(result.checkbox).toEqual([true, 'feature-enabled', 'enabled'])
  expect(result.keyboard).toEqual(['ArrowRight', 1, 3, true, false])
  expect(result.link[0]).toContain('/docs')
  expect(result.link.slice(1)).toEqual([2, 17, 19])
  expect(result.image[0]).toContain('data:image/svg+xml')
})
