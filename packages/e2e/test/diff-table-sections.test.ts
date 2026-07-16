import { test, expect } from '../src/fixtures.ts'

test('diff - table sections, columns, and cell spans', async ({ page }) => {
  await page.goto('/diff/table-sections.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const table = page.locator('#sectioned-table')
  expect(
    await table
      .locator(':scope > *')
      .evaluateAll((elements) => elements.map((element) => element.tagName)),
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
  await expect(table.locator('tbody > tr')).toHaveCount(3)
  await expect(table.locator('tbody > tr').nth(0).locator('td')).toHaveText([
    'virtual-dom',
    '120',
  ])
  await expect(
    table.locator('tbody > tr').nth(1).locator('td').first(),
  ).toHaveAttribute('rowspan', '2')
  await expect(table.locator('tbody > tr').nth(2)).toHaveText(
    'browser coverage',
  )
  await expect(table.locator('tfoot td')).toHaveAttribute('colspan', '2')
  await expect(table.locator('tfoot td')).toHaveText('Total 205')
})
