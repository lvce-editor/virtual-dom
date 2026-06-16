import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - change 10k element class names', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'change-element-class-names')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(10_000)
  expect(result.child0.className).toBe('new-item-0')
  expect(result.child5000.className).toBe('new-item-5000')
  expect(result.lastChild.className).toBe('new-item-9999')
})
