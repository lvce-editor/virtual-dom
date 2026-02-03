import { test, expect } from '../src/fixtures.ts'

test('diff - reference node basic', async ({ page }) => {
  await page.goto('/diff/reference-node-basic.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container).toBeVisible()

  // Check that the reference node is present
  const refNode = container.locator('span')
  await expect(refNode).toBeVisible()
  await expect(refNode).toContainText('Referenced Component')
})
