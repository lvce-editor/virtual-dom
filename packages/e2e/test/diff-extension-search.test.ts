import { test, expect } from '../src/fixtures.ts'

test('diff - extension search', async ({ page }) => {
  await page.goto('/diff/extension-search=results.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>First</span><span>Second</span></div>')
})
