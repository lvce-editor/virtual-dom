import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addExplorerReset } from './prepareExplorerServer.ts'

const assertResetAdded = (invoke: string): void => {
  const source = `const executeAllTest = async () => {
    await ${invoke}('Layout.reset');
  };`
  const result = addExplorerReset(source)

  assert.ok(
    result.includes(
      `await ${invoke}('FileSystem.remove', 'memfs:///workspace');`,
    ),
  )
  assert.ok(result.includes(`await ${invoke}('Layout.hideSideBar');`))
  assert.ok(result.includes(`await ${invoke}('Layout.showSideBar');`))
  assert.equal(addExplorerReset(result), result)
}

void test('addExplorerReset supports an unaliased invoke', () => {
  assertResetAdded('invoke')
})

void test('addExplorerReset supports an aliased invoke', () => {
  assertResetAdded('invoke$1')
})

void test('addExplorerReset rejects an unknown test worker bundle', () => {
  assert.throws(
    () => addExplorerReset('const value = 1'),
    /Could not find the Explorer test reset hook/,
  )
})
