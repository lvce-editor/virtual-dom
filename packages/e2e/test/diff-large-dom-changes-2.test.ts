import { test, expect } from '../src/fixtures.ts'

test('diff - large dom changes 2', async ({ page }) => {
  await page.goto('/diff/large-dom-changes-2.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const editor = container.locator('.Viewlet.Editor')
  const thumb = container.locator('.ScrollBarThumb.ScrollBarThumbVertical')

  await expect(editor).toHaveCount(1)
  await expect(thumb).toHaveAttribute(
    'style',
    'height: 20px; translate: 0px 0.332839px;',
  )
})
