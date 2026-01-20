import { test, expect } from '../src/fixtures.ts'

test('diff - empty to content', async ({ page }) => {
  await page.goto('/diff/empty-to-content.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>New Content</span></div>')
})
