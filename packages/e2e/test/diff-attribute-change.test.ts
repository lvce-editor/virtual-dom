import { test, expect } from '../src/fixtures.ts'

test('diff - attribute change', async ({ page }) => {
  await page.goto('/diff/attribute-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div class="new-class" id="new-id">Hello</div>')
})
