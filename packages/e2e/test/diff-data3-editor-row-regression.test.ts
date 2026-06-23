import { test, expect } from '../src/fixtures.ts'

test('diff - data3 editor row regression', async ({ page }) => {
  const errors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })

  await page.goto('/diff/data3-editor-row-regression.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  expect(
    errors.filter((error) => error.includes('Cannot navigate to sibling')),
  ).toEqual([])

  const container = page.locator('#diff-container')
  await expect(container).toHaveText('    "@cspell/dict-dotnet": "^5.0.13",')
  await expect(container.locator('.EditorRow > span')).toHaveCount(10)
})
