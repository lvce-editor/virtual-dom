import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - replace 10k elements with text nodes', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'replace-elements-with-text')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(0)
  expect(result.child0.nodeType).toBe(3)
  expect(result.firstNodeValue).toBe('text-0;')
  expect(result.child5000.nodeValue).toBe('text-5000;')
  expect(result.lastNodeValue).toBe('text-9999;')
})
