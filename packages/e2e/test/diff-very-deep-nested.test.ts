import { test, expect } from '../src/fixtures.ts'

test('diff - very deep nested changes', async ({ page }) => {
  await page.goto('/diff/very-deep-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const span = container.locator('span')
  await expect(span).toBeVisible()
  await expect(span).toHaveText('Very Deep')
  const divs = container.locator('div')
  await expect(divs).toHaveCount(6)
})
