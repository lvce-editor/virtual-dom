import { test, expect } from '@playwright/test'

test.skip('diff - textarea element changes', async ({ page }) => {
  await page.goto('/diff/textarea-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const textarea = container.locator('textarea')
  await expect(textarea).toBeVisible()
  await expect(textarea).toHaveAttribute('id', 'message')
  await expect(textarea).toHaveClass('textarea')
  await expect(textarea).toHaveAttribute('rows', '5')
  await expect(textarea).toHaveAttribute('cols', '40')
  await expect(textarea).toHaveAttribute('placeholder', 'Enter message')
})
