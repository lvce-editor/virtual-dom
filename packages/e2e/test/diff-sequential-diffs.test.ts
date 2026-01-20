import { test, expect } from '../src/fixtures.ts'

test('diff - sequential diffs', async ({ page }) => {
  await page.goto('/diff/sequential-diffs.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const div = container.locator('div')
  await expect(div).toBeVisible()
  const spans = div.locator('span')
  await expect(spans).toHaveCount(2)
  await expect(spans.nth(0)).toHaveText('First Update')
  await expect(spans.nth(0)).toHaveClass('highlighted')
  await expect(spans.nth(1)).toHaveText('Second Child')
})
