import { test, expect } from '@playwright/test'

test.skip('diff - section aside structure changes', async ({ page }) => {
  await page.goto('/diff/section-aside-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const section = container.locator('section')
  await expect(section).toBeVisible()
  await expect(section).toHaveClass('main-content')
  await expect(section).toHaveText('Main Content')
  const aside = container.locator('aside')
  await expect(aside).toBeVisible()
  await expect(aside).toHaveClass('sidebar')
  await expect(aside).toHaveText('Sidebar Content')
})
