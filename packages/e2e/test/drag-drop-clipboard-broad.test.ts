import { test, expect } from '../src/fixtures.ts'

test('broad drag drop and clipboard e2e coverage', async ({ page }) => {
  await page.goto('/diff/drag-drop-clipboard-broad.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomBroadDragDropClipboardResult
  })

  expect(result.dragInfo).toEqual({
    legacyText: 'legacy payload',
    newText: 'new payload',
    newItemCount: 1,
  })
  expect(result.dropAndClipboard).toEqual({
    dropFileLength: 1,
    dropFileName: 'hello.txt',
    file2IdsLength: 1,
    file2Kind: 'string',
    file2Type: 'text/plain',
    file2Value: 'plain text item',
    clipboardFileLength: 1,
    clipboardFileName: 'pasted.txt',
  })
  expect(result.updatedDragMetadata).toEqual({
    firstText: 'old payload',
    secondText: 'fresh payload',
  })
})
