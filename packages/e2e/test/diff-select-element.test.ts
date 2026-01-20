import { test, expect } from '@playwright/test'

test('diff - select element changes', async ({ page }) => {
  await page.goto('/diff/select-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const select = container.locator('select')
  await expect(select).toBeVisible()
  await expect(select).toHaveAttribute('id', 'country-select')
  await expect(select).toHaveClass('form-select')
  const options = select.locator('option')
  await expect(options).toHaveCount(3)
  await expect(options.nth(0)).toHaveAttribute('value', 'us')
  await expect(options.nth(0)).toHaveText('United States')
  await expect(options.nth(1)).toHaveAttribute('value', 'uk')
  await expect(options.nth(1)).toHaveText('United Kingdom')
  await expect(options.nth(2)).toHaveAttribute('value', 'ca')
  await expect(options.nth(2)).toHaveText('Canada')
})
