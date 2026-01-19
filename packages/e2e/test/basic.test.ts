import { test, expect } from '@playwright/test'

test('renders virtual dom into root element', async ({ page }) => {
  await page.goto('/')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomTestComplete === true
  })

  const testDiv = page.locator('#test-div')
  await expect(testDiv).toBeVisible()
  await expect(testDiv).toHaveClass('test-class')

  const spans = testDiv.locator('span')
  await expect(spans).toHaveCount(2)
  await expect(spans.nth(0)).toHaveText('Hello')
  await expect(spans.nth(1)).toHaveText('World')
})
