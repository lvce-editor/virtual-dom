import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - remove first element from 10k children', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'remove-first-element')

  expect(result.childNodeCount).toBe(9_999)
  expect(result.childElementCount).toBe(9_999)
  expect(result.child0.className).toBe('item-1')
  expect(result.child4999.className).toBe('item-5000')
  expect(result.lastChild.className).toBe('item-9999')
})
