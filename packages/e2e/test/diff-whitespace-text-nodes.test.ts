import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test('diff - whitespace text nodes', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'whitespace-text-nodes')

  expect(result.childNodeCount).toBe(3)
  expect(result.childElementCount).toBe(0)
  expect(result.child0.nodeValue).toBe('  leading')
  expect(result.child1.nodeValue).toBe('\nline\n')
  expect(result.lastNodeValue).toBe('trailing  ')
})
