import { test, expect } from '../src/fixtures.ts'

test('diff - table structure', async ({ page }) => {
  await page.goto('/diff/table-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<table><tr><td>New Cell</td></tr></table>')
})
