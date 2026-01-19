import { test, expect } from '@playwright/test'

test('applies diff patches to update DOM', async ({ page }) => {
  await page.goto('/diff.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return window.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container).toBeVisible()

  const firstDiv = container.locator('div').first()
  await expect(firstDiv).toHaveText('Updated Text')
  await expect(firstDiv).toHaveClass('updated-class')
})
