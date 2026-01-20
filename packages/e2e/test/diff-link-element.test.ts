import { test, expect } from '../src/fixtures.ts'

test('diff - link element changes', async ({ page }) => {
  await page.goto('/diff/link-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const link = container.locator('a')
  await expect(link).toBeVisible()
  await expect(link).toHaveText('External Link')
  await expect(link).toHaveAttribute('href', 'https://example.com')
  await expect(link).toHaveAttribute('target', '_blank')
  await expect(link).toHaveClass('external-link')
})
