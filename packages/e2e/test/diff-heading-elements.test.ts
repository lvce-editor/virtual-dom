import { test, expect } from '@playwright/test'

test('diff - heading elements changes', async ({ page }) => {
  await page.goto('/diff/heading-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const h1 = container.locator('h1')
  const h2 = container.locator('h2')
  await expect(h1).toBeVisible()
  await expect(h1).toHaveText('Main Title')
  await expect(h1).toHaveClass('main-title')
  await expect(h2).toBeVisible()
  await expect(h2).toHaveText('Subtitle')
  await expect(h2).toHaveClass('subtitle')
})
