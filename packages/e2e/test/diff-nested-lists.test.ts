import { test, expect } from '../src/fixtures.ts'

test('diff - nested lists changes', async ({ page }) => {
  await page.goto('/diff/nested-lists.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const ul = container.locator('ul').first()
  await expect(ul).toBeVisible()
  const lis = ul.locator('li')
  await expect(lis).toHaveCount(2)
  await expect(lis.nth(0)).toHaveText('Item 1')
  const nestedUl = lis.nth(1).locator('ul')
  await expect(nestedUl).toBeVisible()
  const nestedLis = nestedUl.locator('li')
  await expect(nestedLis).toHaveCount(2)
  await expect(nestedLis.nth(0)).toHaveText('Subitem 1')
  await expect(nestedLis.nth(1)).toHaveText('Subitem 2')
})
