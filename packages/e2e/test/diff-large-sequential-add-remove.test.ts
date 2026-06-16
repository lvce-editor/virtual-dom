import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test.setTimeout(60_000)

test('diff - large sequential add remove', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'large-sequential-add-remove')

  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.childNodeCount).toBe(0)
  expect(result.childElementCount).toBe(0)
  expect(result.textContentLength).toBe(0)
})
