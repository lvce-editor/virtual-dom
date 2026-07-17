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
  assert.match(result, /globalThis\.____receivedMessageTimings/)
  assert.match(result, /receivedAt: performance\.now\(\)/)
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

void test('addRendererMessageCapture upgrades an existing message capture', () => {
  const legacy = `// virtual-dom-message-benchmark-capture
const ____receivedMessages = [];
globalThis.____receivedMessages = ____receivedMessages;
const ____captureRendererWorkerMessage = event => {
  ____receivedMessages.push(event.data);
};
${source}`
  const result = addRendererMessageCapture(legacy)

  assert.match(result, /globalThis\.____receivedMessageTimings/)
  assert.equal(
    result.match(/virtual-dom-message-benchmark-capture/g)?.length,
    1,
  )
})
