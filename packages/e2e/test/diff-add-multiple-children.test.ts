import { test, expect } from '@playwright/test'

test('diff - add multiple children', async ({ page }) => {
  await page.goto('/diff/add-multiple-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>First</span><span>Second</span><span>Third</span></div>',
  )
})
