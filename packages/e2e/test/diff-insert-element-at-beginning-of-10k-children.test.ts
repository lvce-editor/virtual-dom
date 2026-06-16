import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - insert element at beginning of 10k children', async ({
  page,
}) => {
  const result = await runLargeDomDiff(page, 'insert-element-at-beginning')

  expect(result.childNodeCount).toBe(10_001)
  expect(result.childElementCount).toBe(10_001)
  expect(result.child0.className).toBe('inserted')
  expect(result.child1.className).toBe('item-0')
  expect(result.lastChild.className).toBe('item-9999')
})
