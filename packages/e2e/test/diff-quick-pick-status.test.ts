import { test, expect } from '../src/fixtures.ts'

test('diff - quick pick status', async ({ page }) => {
  await page.goto('/diff/quick-pick-status.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const status = page.locator('.QuickPickStatus')
  await expect(status).toHaveText('No Results')
  const items = page.locator('.ListItems > .QuickPickItem')
  await expect(items).toHaveCount(1)
  const labels = page.locator('.QuickPickItemLabel')
  await expect(labels).toHaveCount(0)
})
