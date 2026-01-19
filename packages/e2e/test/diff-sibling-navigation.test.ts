import { test, expect } from '@playwright/test'

test.skip('diff - sibling navigation complex', async ({ page }) => {
  await page.goto('/diff/sibling-navigation.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><div>First</div><div>Updated Second</div><div>Third</div></div>',
  )
})
