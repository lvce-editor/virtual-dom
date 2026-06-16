import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - mixed first middle last text changes', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'mixed-first-middle-last-changes')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(0)
  expect(result.firstNodeValue).toBe('changed-first;')
  expect(result.child1.nodeValue).toBe('stable-1;')
  expect(result.child5000.nodeValue).toBe('changed-middle;')
  expect(result.lastNodeValue).toBe('changed-last;')
})
