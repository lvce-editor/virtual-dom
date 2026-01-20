import { test, expect } from '@playwright/test'

test('diff - multiple children text changes', async ({ page }) => {
  await page.goto('/diff/multiple-children-text.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>One</span><span>Two</span><span>Three</span></div>',
  )
})
