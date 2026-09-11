import { test, expect } from '../src/fixtures.ts'

test('diff - table sections, columns, and cell spans', async ({ page }) => {
  await page.goto('/diff/table-sections.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const table = page.locator('#sectioned-table')
  const sections = table.locator(':scope > *')
  expect(
    await sections.evaluateAll((elements) =>
      elements.map((element) => element.tagName),
    ),
  ).toEqual(['COLGROUP', 'THEAD', 'TBODY', 'TFOOT'])

  const columns = table.locator('colgroup > col')
  await expect(columns).toHaveCount(2)
  expect(
    await columns.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('style')),
    ),
  ).toEqual(['width: 160px;', 'width: 90px;'])

  const headers = table.locator('thead th')
  await expect(headers).toHaveText(['Package', 'Tests'])
  expect(
    await headers.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('scope')),
    ),
  ).toEqual(['col', 'col'])
  const rows = table.locator('tbody > tr')
  await expect(rows).toHaveCount(3)
  const firstRowCells = rows.nth(0).locator('td')
  await expect(firstRowCells).toHaveText(['virtual-dom', '120'])
  const spanningCell = rows.nth(1).locator('td').first()
  await expect(spanningCell).toHaveAttribute('rowspan', '2')
  const lastRow = rows.nth(2)
  await expect(lastRow).toHaveText('browser coverage')
  const footer = table.locator('tfoot td')
  await expect(footer).toHaveAttribute('colspan', '2')
  await expect(footer).toHaveText('Total 205')
})
