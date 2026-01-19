import { test, expect } from '@playwright/test'

test('diff - replace nested structure', async ({ page }) => {
  await page.goto('/diff/replace-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><div><span>New Structure</span></div></div>')
})
