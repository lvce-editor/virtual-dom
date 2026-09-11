import { test, expect } from '../src/fixtures.ts'

test('diff - semantic elements and reflected properties', async ({ page }) => {
  await page.goto('/diff/semantic-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const root = page.locator('#semantic-root')
  const children = root.locator(':scope > *')
  await expect(children).toHaveCount(10)
  expect(
    await children.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['H3', 'H4', 'H5', 'H6', 'FIGURE', 'DL', 'OL', 'P', 'SEARCH', 'HR'])

  const heading3 = root.locator('h3')
  await expect(heading3).toHaveText('Heading 3 after')
  const heading6 = root.locator('h6')
  await expect(heading6).toHaveText('Heading 6 after')
  const caption = root.locator('figcaption')
  await expect(caption).toHaveText('Figure caption after')
  const image = root.locator('#semantic-image')
  await expect(image).toHaveAttribute('alt', 'Diagram after')
  await expect(image).toHaveAttribute('width', '32')
  await expect(image).toHaveAttribute('height', '24')
  const descriptions = root.locator('dd')
  await expect(descriptions).toHaveText(['Chromium', 'Ready'])
  const items = root.locator('ol > li')
  await expect(items).toHaveText(['Render', 'Verify'])

  const inlineElements = root.locator('#semantic-inline-elements > *')
  expect(
    await inlineElements.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['CITE', 'CODE', 'DATA', 'DEL', 'I', 'INS', 'KBD', 'TIME', 'BR'])
  const data = root.locator('data')
  await expect(data).toHaveAttribute('value', '2')
  const deleted = root.locator('del')
  await expect(deleted).toHaveAttribute('datetime', '2026-07-16')
  const inserted = root.locator('ins')
  await expect(inserted).toHaveAttribute('datetime', '2026-07-16')
  const time = root.locator('time')
  await expect(time).toHaveAttribute('datetime', '10:30')
  const query = root.locator('input[name="semantic-query"]')
  await expect(query).toHaveValue('after')
  await expect(query).toHaveAttribute('placeholder', 'Search after')
})
