import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - remove middle element from 10k children', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'remove-middle-element')

  expect(result.childNodeCount).toBe(9999)
  expect(result.childElementCount).toBe(9999)
  expect(result.child4999.className).toBe('item-4999')
  expect(result.child5000.className).toBe('item-5001')
  expect(result.lastChild.className).toBe('item-9999')
})
