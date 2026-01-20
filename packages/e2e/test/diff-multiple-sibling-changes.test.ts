import { test, expect } from '@playwright/test'

test.skip('diff - multiple sibling changes', async ({ page }) => {
  await page.goto('/diff/multiple-sibling-changes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const spans = container.locator('span')
  await expect(spans).toHaveCount(3)
  await expect(spans.nth(0)).toHaveText('A Updated')
  await expect(spans.nth(0)).toHaveClass('updated')
  await expect(spans.nth(1)).toHaveText('B Updated')
  await expect(spans.nth(1)).toHaveClass('updated')
  await expect(spans.nth(2)).toHaveText('C Updated')
  await expect(spans.nth(2)).toHaveClass('updated')
})
