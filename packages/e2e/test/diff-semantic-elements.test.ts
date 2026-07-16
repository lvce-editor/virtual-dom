import { test, expect } from '../src/fixtures.ts'

test('diff - semantic elements and reflected properties', async ({ page }) => {
  await page.goto('/diff/semantic-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const root = page.locator('#semantic-root')
  await expect(root.locator(':scope > *')).toHaveCount(10)
  expect(
    await root
      .locator(':scope > *')
      .evaluateAll((elements) => elements.map((element) => element.tagName)),
  ).toEqual(['H3', 'H4', 'H5', 'H6', 'FIGURE', 'DL', 'OL', 'P', 'SEARCH', 'HR'])

  await expect(root.locator('h3')).toHaveText('Heading 3 after')
  await expect(root.locator('h6')).toHaveText('Heading 6 after')
  await expect(root.locator('figcaption')).toHaveText('Figure caption after')
  await expect(root.locator('#semantic-image')).toHaveAttribute(
    'alt',
    'Diagram after',
  )
  await expect(root.locator('#semantic-image')).toHaveAttribute('width', '32')
  await expect(root.locator('#semantic-image')).toHaveAttribute('height', '24')
  await expect(root.locator('dd')).toHaveText(['Chromium', 'Ready'])
  await expect(root.locator('ol > li')).toHaveText(['Render', 'Verify'])

  const inlineElements = root.locator('#semantic-inline-elements > *')
  expect(
    await inlineElements.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['CITE', 'CODE', 'DATA', 'DEL', 'I', 'INS', 'KBD', 'TIME', 'BR'])
  await expect(root.locator('data')).toHaveAttribute('value', '2')
  await expect(root.locator('del')).toHaveAttribute('datetime', '2026-07-16')
  await expect(root.locator('ins')).toHaveAttribute('datetime', '2026-07-16')
  await expect(root.locator('time')).toHaveAttribute('datetime', '10:30')
  await expect(root.locator('input[name="semantic-query"]')).toHaveValue(
    'after',
  )
  await expect(root.locator('input[name="semantic-query"]')).toHaveAttribute(
    'placeholder',
    'Search after',
  )
})
