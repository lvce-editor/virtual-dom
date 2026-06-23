import { test, expect } from '../src/fixtures.ts'

test('diff - large dom changes 2', async ({ page }) => {
  await page.goto('/diff/large-dom-changes-2.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toContain('translate: 0 0.3328394497782955px')
  expect(innerHTML).not.toContain('translate: 0px 0.332839px')
})
