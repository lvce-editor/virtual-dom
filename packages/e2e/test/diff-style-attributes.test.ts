import { test, expect } from '../src/fixtures.ts'

test('diff - style attributes changes', async ({ page }) => {
  await page.goto('/diff/style-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const span = container.locator('span')
  await expect(span).toBeVisible()
  await expect(span).toHaveCSS('width', '100px')
  await expect(span).toHaveCSS('height', '50px')
  await expect(span).toHaveCSS('top', '10px')
  await expect(span).toHaveCSS('left', '20px')
  await expect(span).toHaveCSS('margin-top', '5px')
  await expect(span).toHaveCSS('padding-left', '15px')
  await expect(span).toHaveCSS('padding-right', '15px')
})
