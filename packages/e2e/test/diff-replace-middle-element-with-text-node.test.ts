import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - replace middle element with text node', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'replace-middle-element-with-text')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(9_999)
  expect(result.child4999.className).toBe('item-4999')
  expect(result.child5000.nodeType).toBe(3)
  expect(result.child5000.nodeValue).toBe('middle-text;')
  expect(result.child5001.className).toBe('item-5001')
  expect(result.lastChild.className).toBe('item-9999')
})
