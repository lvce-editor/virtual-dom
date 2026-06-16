import { test, expect } from '../src/fixtures.ts'
import { runLargeDomDiff } from './diff-large-dom-test-helper.ts'

test('diff - special character text node', async ({ page }) => {
  const result = await runLargeDomDiff(page, 'special-character-text')

  expect(result.childNodeCount).toBe(1)
  expect(result.childElementCount).toBe(0)
  expect(result.child0.nodeType).toBe(3)
  expect(result.textContent).toBe('<button>&"quoted"</button>')
})
