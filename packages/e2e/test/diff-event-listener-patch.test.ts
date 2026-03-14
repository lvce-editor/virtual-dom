import { test, expect } from '../src/fixtures.ts'

test('diff - event listener patch updates click handler', async ({ page }) => {
  await page.goto('/diff/event-listener-patch.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const button = container.locator('button')
  await expect(button).toHaveText('0')
  await button.click()
  await expect(button).toHaveText('2')
})
