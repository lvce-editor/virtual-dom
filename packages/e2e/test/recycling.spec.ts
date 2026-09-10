import { expect, test } from '../src/fixtures.ts'

test('recycles disposed nodes without stale attributes or listeners', async ({
  page,
}) => {
  await page.goto('/recycling/')
  await expect(page.getByText('New text')).toBeVisible()
  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.recyclingResult
  })
  expect(result).toEqual({
    reusedElement: true,
    reusedText: true,
    clearedText: '',
    clicks: 1,
    attributes: [],
  })
})
