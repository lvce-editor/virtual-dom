import { test, expect } from '../src/fixtures.ts'

test('diff - text node change', async ({ page }) => {
  await page.goto('/diff/text-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('Updated Text')
})
