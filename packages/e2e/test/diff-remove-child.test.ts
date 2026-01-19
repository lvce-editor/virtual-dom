import { test, expect } from '@playwright/test'

test('diff - remove child', async ({ page }) => {
  await page.goto('/diff/remove-child.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>First</span></div>')
})
