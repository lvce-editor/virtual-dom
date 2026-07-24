import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addExplorerResetHook } from './prepareExplorerServer.ts'

void test('addExplorerResetHook instruments the test worker reset', () => {
  const source = `const reset = async () => {
    await invoke('Layout.reset');
}`
  const result = addExplorerResetHook(source)

  assert.match(
    result,
    /await invoke\('FileSystem\.remove', 'memfs:\/\/\/workspace'\)/,
  )
  assert.match(result, /await invoke\('Layout\.hideSideBar'\)/)
  assert.match(result, /await invoke\('Layout\.showSideBar'\)/)
  assert.equal(addExplorerResetHook(result), result)
})

void test('addExplorerResetHook preserves a renamed invoke helper', () => {
  const source = `const reset = async () => {
    await invoke$1('Layout.reset');
}`
  const result = addExplorerResetHook(source)

  assert.match(
    result,
    /await invoke\$1\('FileSystem\.remove', 'memfs:\/\/\/workspace'\)/,
  )
  assert.match(result, /await invoke\$1\('Layout\.hideSideBar'\)/)
  assert.match(result, /await invoke\$1\('Layout\.showSideBar'\)/)
  assert.doesNotMatch(result, /await invoke\(/)
  assert.equal(addExplorerResetHook(result), result)
})

void test('addExplorerResetHook rejects an unknown test worker bundle', () => {
  assert.throws(
    () => addExplorerResetHook('const value = 1'),
    /Could not find the Explorer test reset hook/,
  )
})
