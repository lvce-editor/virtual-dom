import { test, expect } from '@playwright/test'

test('diff - input element changes', async ({ page }) => {
  await page.goto('/diff/input-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const input = container.locator('input')
  await expect(input).toBeVisible()
  await expect(input).toHaveAttribute('type', 'email')
  await expect(input).toHaveAttribute('id', 'email-input')
  await expect(input).toHaveClass('form-control')
  await expect(input).toHaveAttribute('placeholder', 'Enter email')
})
