import { test, expect } from '@playwright/test'

test('diff - reorder children', async ({ page }) => {
  await page.goto('/diff/reorder-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const spans = container.locator('span')
  await expect(spans).toHaveCount(3)
  await expect(spans.nth(0)).toHaveText('Third')
  await expect(spans.nth(1)).toHaveText('First')
  await expect(spans.nth(2)).toHaveText('Second')
})
