import { test, expect } from '@playwright/test'

test('diff - remove all children', async ({ page }) => {
  await page.goto('/diff/remove-all-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const div = container.locator('div')
  await expect(div).toBeVisible()
  const children = div.locator('*')
  await expect(children).toHaveCount(0)
})
