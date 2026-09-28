import { test, expect } from '../src/fixtures.ts'

test('diff - image element changes', async ({ page }) => {
  await page.route('https://example.com/image.jpg', (route) =>
    route.fulfill({
      contentType: 'image/svg+xml',
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"/>',
    }),
  )
  await page.goto('/diff/image-element.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const img = container.locator('img')
  await expect(img).toBeVisible()
  await expect(img).toHaveJSProperty('naturalWidth', 1)
  await expect(img).toHaveAttribute('src', 'https://example.com/image.jpg')
  await expect(img).toHaveAttribute('alt', 'Example Image')
  await expect(img).toHaveAttribute('id', 'main-image')
  await expect(img).toHaveAttribute('width', '200')
  await expect(img).toHaveAttribute('height', '150')
})
