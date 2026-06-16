import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - add 10k element data attributes', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'add-element-data-attributes')

  expect(result.childNodeCount).toBe(10_000)
  expect(result.childElementCount).toBe(10_000)
  expect(result.child0.dataValue).toBe('value-0')
  expect(result.child5000.dataValue).toBe('value-5000')
  expect(result.lastChild.dataValue).toBe('value-9999')
})
