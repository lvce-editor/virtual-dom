import { test, expect } from '../src/fixtures.ts'

test('diff - reference node update', async ({ page }) => {
  await page.goto('/diff/reference-node-update.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container).toBeVisible()

  // Check that the reference node was updated to the second component
  const refNode = container.locator('span')
  await expect(refNode).toBeVisible()
  await expect(refNode).toContainText('Component 2')
})
