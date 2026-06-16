import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - update 10k text nodes', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'update-text-nodes')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(0)
  expect(result.firstNodeValue).toBe('new-0;')
  expect(result.child5000.nodeValue).toBe('new-5000;')
  expect(result.lastNodeValue).toBe('new-9999;')
})
