import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  addExplorerResetHook,
  addWorkspaceSetPathHook,
} from './prepareExplorerServer.ts'

void test('addExplorerResetHook instruments the test worker reset', () => {
  const source = `const reset = async () => {
    await invoke('Layout.reset');
}`
  const result = addExplorerResetHook(source)

  assert.match(
    result,
    /await invoke\('FileSystem\.remove', 'memfs:\/\/\/workspace'\)/,
  )
  assert.match(
    result,
    /await invoke\('FileSystem\.mkdir', 'memfs:\/\/\/workspace'\)/,
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
  assert.match(
    result,
    /await invoke\$1\('FileSystem\.mkdir', 'memfs:\/\/\/workspace'\)/,
  )
  assert.match(result, /await invoke\$1\('Layout\.hideSideBar'\)/)
  assert.match(result, /await invoke\$1\('Layout\.showSideBar'\)/)
  assert.doesNotMatch(result, /await invoke\(/)
  assert.equal(addExplorerResetHook(result), result)
})

void test('addExplorerResetHook upgrades an existing workspace reset', () => {
  const source = `const reset = async () => {
    await invoke$1('FileSystem.remove', 'memfs:///workspace');
    await invoke$1('Layout.reset');
}`
  const result = addExplorerResetHook(source)

  assert.match(
    result,
    /await invoke\$1\('FileSystem\.mkdir', 'memfs:\/\/\/workspace'\)/,
  )
  assert.equal(addExplorerResetHook(result), result)
})

void test('addExplorerResetHook rejects an unknown test worker bundle', () => {
  assert.throws(
    () => addExplorerResetHook('const value = 1'),
    /Could not find the Explorer test reset hook/,
  )
})

void test('addWorkspaceSetPathHook creates the workspace folder', () => {
  const source = `const setPath = async path => {
  await invoke$3('Workspace.setPath', path);
};`
  const result = addWorkspaceSetPathHook(source)

  assert.match(result, /await invoke\$3\('FileSystem\.mkdir', path\)/)
  assert.match(result, /await invoke\$3\('Workspace\.setPath', path\)/)
  assert.equal(addWorkspaceSetPathHook(result), result)
})

void test('addWorkspaceSetPathHook rejects an unknown test worker bundle', () => {
  assert.throws(
    () => addWorkspaceSetPathHook('const value = 1'),
    /Could not find the workspace setPath helper/,
  )
})
