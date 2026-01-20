import { test, expect } from '../src/fixtures.ts'

test('diff - article structure changes', async ({ page }) => {
  await page.goto('/diff/article-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const article = container.locator('article')
  await expect(article).toBeVisible()
  const header = article.locator('header')
  await expect(header).toBeVisible()
  const h1 = header.locator('h1')
  await expect(h1).toHaveText('Article Title')
  const p = article.locator('p')
  await expect(p).toHaveText('Article Content')
  const footer = article.locator('footer')
  await expect(footer).toHaveText('Footer')
})
