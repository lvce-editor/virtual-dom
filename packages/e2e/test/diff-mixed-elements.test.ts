import { test, expect } from '../src/fixtures.ts'

test('diff - mixed elements changes', async ({ page }) => {
  await page.goto('/diff/mixed-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const h1 = container.locator('h1')
  const p = container.locator('p')
  const button = container.locator('button')
  const span = container.locator('span')
  await expect(h1).toBeVisible()
  await expect(h1).toHaveText('Title')
  await expect(p).toBeVisible()
  await expect(p).toHaveText('Paragraph')
  await expect(button).toBeVisible()
  await expect(button).toHaveText('Click')
  await expect(span).toBeVisible()
  await expect(span).toHaveText('Footer')
})
