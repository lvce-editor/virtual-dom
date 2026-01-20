import { test, expect } from '@playwright/test'

test.skip('diff - button element changes', async ({ page }) => {
  await page.goto('/diff/button-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const button = container.locator('button')
  await expect(button).toBeVisible()
  await expect(button).toHaveText('Submit')
  await expect(button).toHaveClass('primary')
  await expect(button).toHaveAttribute('id', 'submit-btn')
})
