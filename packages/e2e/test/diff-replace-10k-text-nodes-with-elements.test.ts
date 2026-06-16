import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - replace 10k text nodes with elements', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'replace-text-with-elements')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(10_000)
  expect(result.child0.nodeType).toBe(1)
  expect(result.child0.className).toBe('item-0')
  expect(result.child5000.className).toBe('item-5000')
  expect(result.lastChild.className).toBe('item-9999')
})
