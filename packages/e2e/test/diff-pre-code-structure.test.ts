import { test, expect } from '@playwright/test'

test.skip('diff - pre code structure changes', async ({ page }) => {
  await page.goto('/diff/pre-code-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const pre = container.locator('pre')
  await expect(pre).toBeVisible()
  await expect(pre).toHaveClass('code-block')
  const code = pre.locator('code')
  await expect(code).toBeVisible()
  await expect(code).toHaveText('const x = 1;')
})
