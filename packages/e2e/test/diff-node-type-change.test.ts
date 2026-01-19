import { test, expect } from '@playwright/test'

test.skip('diff - node type change', async ({ page }) => {
  await page.goto('/diff/node-type-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<span>Hello</span>')
})
