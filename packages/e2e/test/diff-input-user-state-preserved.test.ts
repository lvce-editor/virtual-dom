import { test, expect } from '../src/fixtures.ts'

test('diff - input user state is preserved across unrelated patches', async ({
  page,
}) => {
  await page.goto('/diff/input-user-state-preserved.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomInputStateResult
  })

  expect(result.activeElementId).toBe('search-input')
  expect(result.value).toBe('hello user')
  expect(result.selectionStart).toBe(2)
  expect(result.selectionEnd).toBe(7)
  expect(result.className).toBe('search-updated')
  expect(result.placeholder).toBe('Search files')
  expect(result.statusText).toBe('after')
})
