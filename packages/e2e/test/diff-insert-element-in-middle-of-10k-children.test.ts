import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - insert element in middle of 10k children', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'insert-element-in-middle')

  expect(result.childNodeCount).toBe(10_001)
  expect(result.childElementCount).toBe(10_001)
  expect(result.child4999.className).toBe('item-4999')
  expect(result.child5000.className).toBe('inserted')
  expect(result.child5001.className).toBe('item-5000')
  expect(result.lastChild.className).toBe('item-9999')
})
