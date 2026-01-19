import { test, expect } from '@playwright/test'

test.skip('diff - attribute removal', async ({ page }) => {
  await page.goto('/diff/attribute-removal.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div>Hello</div>')
})
