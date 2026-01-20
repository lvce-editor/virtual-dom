import { test, expect } from '@playwright/test'

test.skip('diff - aria attributes changes', async ({ page }) => {
  await page.goto('/diff/aria-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const button = container.locator('button')
  await expect(button).toBeVisible()
  await expect(button).toHaveAttribute('aria-labelledby', 'button-label')
  await expect(button).toHaveAttribute('aria-controls', 'content-panel')
  await expect(button).toHaveAttribute('aria-activedescendant', 'active-item')
})
