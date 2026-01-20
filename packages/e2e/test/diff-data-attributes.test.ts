import { test, expect } from '@playwright/test'

test('diff - data attributes changes', async ({ page }) => {
  await page.goto('/diff/data-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const span = container.locator('span')
  await expect(span).toBeVisible()
  await expect(span).toHaveAttribute('data-testid', 'test-span')
  await expect(span).toHaveAttribute('data-value', '123')
  await expect(span).toHaveAttribute('data-status', 'active')
})
