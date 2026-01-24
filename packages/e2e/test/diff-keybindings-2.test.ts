import { test, expect } from '../src/fixtures.ts'

test.skip('diff - keybindings 2', async ({ page }) => {
  await page.goto('/diff/keybindings-2.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('')
})
