import { test, expect } from '@playwright/test'

test('diff - label input structure changes', async ({ page }) => {
  await page.goto('/diff/label-input-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const label = container.locator('label')
  await expect(label).toBeVisible()
  await expect(label).toHaveText('Username')
  await expect(label).toHaveAttribute('for', 'input-field')
  const input = container.locator('input')
  await expect(input).toBeVisible()
  await expect(input).toHaveAttribute('id', 'input-field')
  await expect(input).toHaveAttribute('placeholder', 'Enter username')
})
