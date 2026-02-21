import { test, expect } from '../src/fixtures.ts'

test.skip('diff - various changes 2', async ({ page }) => {
  await page.goto('/diff/various-changes-2.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div class="new-class" id="new-id">Hello</div>')
})
