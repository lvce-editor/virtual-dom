import { test, expect } from '@playwright/test'

test('diff - nav structure changes', async ({ page }) => {
  await page.goto('/diff/nav-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const nav = container.locator('nav')
  await expect(nav).toBeVisible()
  await expect(nav).toHaveClass('main-nav')
  const links = nav.locator('a')
  await expect(links).toHaveCount(3)
  await expect(links.nth(0)).toHaveText('Home')
  await expect(links.nth(0)).toHaveAttribute('href', '/')
  await expect(links.nth(1)).toHaveText('About')
  await expect(links.nth(1)).toHaveAttribute('href', '/about')
  await expect(links.nth(2)).toHaveText('Contact')
  await expect(links.nth(2)).toHaveAttribute('href', '/contact')
})
