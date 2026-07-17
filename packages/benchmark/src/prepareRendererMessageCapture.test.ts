import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addRendererMessageCapture } from './prepareRendererMessageCapture.ts'

const source = `const launchRendererWorker = async () => {};
const state$7 = {
  rpc: undefined
};
const hydrate$3 = async () => {
  const result = await launchRendererWorker();
  if (isError(result)) {
    state$7.rpc = undefined;
    return result;
  }
  state$7.rpc = result.value;
  return success(undefined);
};`

void test('addRendererMessageCapture instruments only the renderer worker RPC', () => {
  const result = addRendererMessageCapture(source)

  assert.match(result, /globalThis\.____receivedMessages/)
  assert.match(
    result,
    /result\.value\.ipc\.addEventListener\('message', ____captureRendererWorkerMessage\)/,
  )
  assert.equal(addRendererMessageCapture(result), result)
})

void test('addRendererMessageCapture rejects an unknown renderer bundle', () => {
  assert.throws(
    () => addRendererMessageCapture('const value = 1'),
    /Could not find the renderer worker launch/,
  )
})
