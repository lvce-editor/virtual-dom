import { test, expect } from '../src/fixtures.ts'

test('diff - multiple attribute changes', async ({ page }) => {
  await page.goto('/diff/multiple-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div class="new-class" id="new-id" data-test="value">Content</div>',
  )
})
