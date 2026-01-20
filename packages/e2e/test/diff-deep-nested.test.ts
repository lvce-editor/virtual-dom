import { test, expect } from '../src/fixtures.ts'

test('diff - deep nested structure', async ({ page }) => {
  await page.goto('/diff/deep-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><div><div><span>Deep Text</span></div></div></div>',
  )
})
