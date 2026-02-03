import { test, expect } from '../src/fixtures.ts'

test('diff - reference node nested', async ({ page }) => {
  await page.goto('/diff/reference-node-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container).toBeVisible()

  // Check header text was updated
  const header = container.locator('header')
  await expect(header).toContainText('Updated Header')

  // Check that reference nodes are present
  const refNodes = container.locator('span.ref-component')
  const count = await refNodes.count()
  expect(count).toBe(2)

  // Verify the first reference node
  await expect(refNodes.first()).toContainText('Inner Component')

  // Verify the second reference node
  await expect(refNodes.last()).toContainText('Footer Component')
})
