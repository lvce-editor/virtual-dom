import { test, expect } from '@playwright/test'

test('diff - image element changes', async ({ page }) => {
  await page.goto('/diff/image-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const img = container.locator('img')
  await expect(img).toBeVisible()
  await expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  await expect(img).toHaveAttribute('alt', 'Example Image')
  await expect(img).toHaveAttribute('id', 'main-image')
  await expect(img).toHaveAttribute('width', '200')
  await expect(img).toHaveAttribute('height', '150')
})
