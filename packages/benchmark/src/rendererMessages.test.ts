import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  getReceivedMessageJsonBytes,
  getRendererCommandSummary,
  getVirtualDomMessageCalls,
  getVirtualDomMessageSummary,
  type JsonValue,
} from './rendererMessages.ts'

void test('getVirtualDomMessageCalls extracts direct and batched virtual DOM calls', () => {
  const messages: readonly JsonValue[] = [
    {
      jsonrpc: '2.0',
      method: 'Viewlet.setDom2',
      params: [1, [{ text: 'Explorer', type: 4 }]],
    },
    {
      jsonrpc: '2.0',
      method: 'Viewlet.sendMultiple',
      params: [
        [
          ['Viewlet.focus', 1],
          ['Viewlet.setPatches', 1, [{ type: 6 }]],
          ['Viewlet.setDom', 2, [{ type: 1 }]],
        ],
      ],
    },
    {
      jsonrpc: '2.0',
      method: 'Viewlet.executeCommands',
      params: [[['Viewlet.send', 3, 'setDom2', [{ text: 'About', type: 4 }]]]],
    },
    { id: 1, jsonrpc: '2.0', result: null },
  ]

  assert.deepEqual(getVirtualDomMessageCalls(messages), [
    {
      method: 'Viewlet.setDom2',
      params: [1, [{ text: 'Explorer', type: 4 }]],
    },
    {
      method: 'Viewlet.setPatches',
      params: [1, [{ type: 6 }]],
    },
    {
      method: 'Viewlet.setDom',
      params: [2, [{ type: 1 }]],
    },
    {
      method: 'Viewlet.setDom2',
      params: [3, [{ text: 'About', type: 4 }]],
    },
  ])
})

void test('getRendererCommandSummary reports no-op CSS, patches, and frame spacing', () => {
  const messages: readonly JsonValue[] = [
    {
      method: 'Viewlet.sendMultiple',
      params: [
        [
          ['Viewlet.setCss', 1, 'a'],
          ['Viewlet.setPatches', 1, []],
        ],
      ],
    },
    {
      method: 'Viewlet.sendMultiple',
      params: [[['Viewlet.setCss', 1, 'a']]],
    },
    {
      method: 'Css.addCssStyleSheet',
      params: ['theme', 'body {}'],
    },
    {
      method: 'Css.addCssStyleSheet',
      params: ['theme', 'body {}'],
    },
  ]
  const summary = getRendererCommandSummary(messages, [
    { index: 0, receivedAt: 100 },
    { index: 1, receivedAt: 110 },
    { index: 2, receivedAt: 120 },
    { index: 3, receivedAt: 130 },
  ])

  assert.equal(summary.count, 5)
  assert.equal(summary.duplicateCss, 2)
  assert.equal(summary.emptyPatches, 1)
  assert.deepEqual(summary.renderBatches, {
    count: 2,
    minIntervalMs: 10,
    under16Ms: 1,
  })
  assert.equal(summary.jsonBytes > 0, true)
  assert.equal(
    getReceivedMessageJsonBytes(messages),
    Buffer.byteLength(JSON.stringify(messages), 'utf8'),
  )
})

void test('getVirtualDomMessageSummary measures UTF-8 JSON bytes', () => {
  const calls = getVirtualDomMessageCalls([
    {
      method: 'Viewlet.setDom2',
      params: [1, [{ text: 'Ä', type: 4 }]],
    },
    {
      method: 'Viewlet.setPatches',
      params: [1, [{ type: 6 }]],
    },
  ])
  const summary = getVirtualDomMessageSummary(calls)

  assert.equal(summary.count, 2)
  assert.equal(
    summary.jsonBytes,
    Buffer.byteLength(JSON.stringify(calls[0]), 'utf8') +
      Buffer.byteLength(JSON.stringify(calls[1]), 'utf8'),
  )
  assert.deepEqual(
    summary.methods.map(({ count, method }) => ({ count, method })),
    [
      { count: 1, method: 'Viewlet.setDom2' },
      { count: 1, method: 'Viewlet.setPatches' },
    ],
  )
})
