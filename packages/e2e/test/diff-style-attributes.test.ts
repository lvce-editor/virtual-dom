import { test, expect } from '../src/fixtures.ts'

test('diff - style attributes changes', async ({ page }) => {
  await page.goto('/diff/style-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const span = container.locator('span')
  await expect(span).toBeVisible()
  const style = await span.evaluate((el) => globalThis.getComputedStyle(el))
  expect(style.width).toBe('100px')
  expect(style.height).toBe('50px')
  expect(style.top).toBe('10px')
  expect(style.left).toBe('20px')
  expect(style.marginTop).toBe('5px')
  expect(style.paddingLeft).toBe('15px')
  expect(style.paddingRight).toBe('15px')
})
