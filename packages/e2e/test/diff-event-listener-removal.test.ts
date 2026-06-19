import { test, expect } from '../src/fixtures.ts'

test('diff - event listener removal detaches old handler', async ({ page }) => {
  await page.goto('/diff/event-listener-removal.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const button = page.locator('#removed-listener-button')
  await expect(button).toBeVisible()
  await button.dispatchEvent('click')

  const clickCount = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomListenerRemovalClickCount()
  })
  expect(clickCount).toBe(0)
})
