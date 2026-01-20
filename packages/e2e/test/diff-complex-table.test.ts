import { test, expect } from '../src/fixtures.ts'

test('diff - complex table changes', async ({ page }) => {
  await page.goto('/diff/complex-table.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const table = container.locator('table')
  await expect(table).toBeVisible()
  await expect(table).toHaveClass('data-table')
  const rows = table.locator('tr')
  await expect(rows).toHaveCount(2)
  const cells = table.locator('td')
  await expect(cells).toHaveCount(4)
  await expect(cells.nth(0)).toHaveText('Cell 1')
  await expect(cells.nth(1)).toHaveText('Cell 2')
  await expect(cells.nth(2)).toHaveText('Cell 3')
  await expect(cells.nth(3)).toHaveText('Cell 4')
})
