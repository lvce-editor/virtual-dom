import { test, expect } from '../src/fixtures.ts'

test('diff - nested text change', async ({ page }) => {
  await page.goto('/diff/nested-text-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>Updated</span></div>')
})
