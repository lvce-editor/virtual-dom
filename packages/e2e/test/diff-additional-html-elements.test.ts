import { test, expect } from '../src/fixtures.ts'

test('diff - additional html elements and properties', async ({ page }) => {
  await page.goto('/diff/additional-html-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const root = page.locator('#additional-elements-root')
  expect(
    await root
      .locator(':scope > *')
      .evaluateAll((elements) => elements.map((element) => element.tagName)),
  ).toEqual(['P', 'BLOCKQUOTE', 'CANVAS', 'IFRAME'])

  const inlineElements = root.locator('#additional-inline-elements > *')
  expect(
    await inlineElements.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['STRONG', 'EM'])
  await expect(root.locator('strong')).toHaveText('strong updates')
  await expect(root.locator('em')).toHaveText('emphasized updates')
  await expect(root.locator('blockquote')).toHaveAttribute(
    'cite',
    '/after-source',
  )
  await expect(root.locator('blockquote')).toHaveText('After quotation')

  const canvas = root.locator('canvas')
  await expect(canvas).toHaveCSS('width', '320px')
  await expect(canvas).toHaveCSS('height', '180px')

  const iframe = root.locator('iframe')
  await expect(iframe).toHaveAttribute('title', 'Updated preview')
  await expect(iframe).toHaveAttribute(
    'srcdoc',
    '<p id="frame-content">after</p>',
  )
  await expect(
    page.frameLocator('#additional-iframe').locator('#frame-content'),
  ).toHaveText('after')
})
