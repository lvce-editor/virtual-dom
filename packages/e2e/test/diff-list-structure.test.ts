import { test, expect } from '../src/fixtures.ts'

test('diff - list structure changes', async ({ page }) => {
  await page.goto('/diff/list-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const ul = container.locator('ul')
  await expect(ul).toBeVisible()
  await expect(ul).toHaveClass('list')
  const lis = ul.locator('li')
  await expect(lis).toHaveCount(3)
  await expect(lis.nth(0)).toHaveText('Item 1')
  await expect(lis.nth(1)).toHaveText('Item 2')
  await expect(lis.nth(2)).toHaveText('Item 3')
})
