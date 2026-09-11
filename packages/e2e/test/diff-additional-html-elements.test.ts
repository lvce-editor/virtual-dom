import { test, expect } from '../src/fixtures.ts'

test('diff - additional html elements and properties', async ({ page }) => {
  await page.goto('/diff/additional-html-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const root = page.locator('#additional-elements-root')
  const children = root.locator(':scope > *')
  expect(
    await children.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['P', 'BLOCKQUOTE', 'CANVAS', 'IFRAME'])

  const inlineElements = root.locator('#additional-inline-elements > *')
  expect(
    await inlineElements.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['STRONG', 'EM'])
  const strong = root.locator('strong')
  await expect(strong).toHaveText('strong updates')
  const emphasis = root.locator('em')
  await expect(emphasis).toHaveText('emphasized updates')
  const quotation = root.locator('blockquote')
  await expect(quotation).toHaveAttribute('cite', '/after-source')
  await expect(quotation).toHaveText('After quotation')

  const canvas = root.locator('canvas')
  await expect(canvas).toHaveCSS('width', '320px')
  await expect(canvas).toHaveCSS('height', '180px')

  const iframe = root.locator('iframe')
  await expect(iframe).toHaveAttribute('title', 'Updated preview')
  await expect(iframe).toHaveAttribute(
    'srcdoc',
    '<p id="frame-content">after</p>',
  )
  const frameContent = page
    .frameLocator('#additional-iframe')
    .locator('#frame-content')
  await expect(frameContent).toHaveText('after')
})
