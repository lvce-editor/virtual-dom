import { test, expect } from '@playwright/test'

test.skip('diff - change middle child', async ({ page }) => {
  await page.goto('/diff/change-middle-child.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>First</span><span>Updated Middle</span><span>Third</span></div>',
  )
})
