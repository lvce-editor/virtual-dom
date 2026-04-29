import { test, expect } from '../src/fixtures.ts'

test('diff - quick pick status', async ({ page }) => {
  await page.goto('/diff/quick-pick-status.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const status = page.locator('.QuickPickStatus')
  await expect(status).toHaveText('No Results')
  await expect(page.locator('.ListItems > .QuickPickItem')).toHaveCount(1)
  await expect(page.locator('.QuickPickItemLabel')).toHaveCount(0)
})
