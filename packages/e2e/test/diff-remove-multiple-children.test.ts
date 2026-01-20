import { test, expect } from '../src/fixtures.ts'

test('diff - remove multiple children', async ({ page }) => {
  await page.goto('/diff/remove-multiple-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div></div>')
})
