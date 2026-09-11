import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { setTimeout } from 'node:timers/promises'
import { getDevToolsWebSocketUrl } from './getDevToolsWebSocketUrl.ts'

void test('waits for Chromium to create the DevTools port file', async (t) => {
  const profile = await mkdtemp(join(tmpdir(), 'devtools-port-'))
  t.after(() => rm(profile, { force: true, recursive: true }))
  const result = getDevToolsWebSocketUrl(profile)
  await setTimeout(50)
  await writeFile(
    join(profile, 'DevToolsActivePort'),
    '1234\n/devtools/browser/test\n',
  )
  assert.equal(await result, 'ws://127.0.0.1:1234/devtools/browser/test')
})

void test('waits for a partially written port file', async (t) => {
  const profile = await mkdtemp(join(tmpdir(), 'devtools-port-'))
  t.after(() => rm(profile, { force: true, recursive: true }))
  const portFile = join(profile, 'DevToolsActivePort')
  await writeFile(portFile, '1234\n')
  const result = getDevToolsWebSocketUrl(profile)
  await setTimeout(50)
  await writeFile(portFile, '1234\n/devtools/browser/test')
  assert.equal(await result, 'ws://127.0.0.1:1234/devtools/browser/test')
})

void test('times out if Chromium never writes its port file', async (t) => {
  const profile = await mkdtemp(join(tmpdir(), 'devtools-port-'))
  t.after(() => rm(profile, { force: true, recursive: true }))
  await assert.rejects(getDevToolsWebSocketUrl(profile, 0), /Timed out/)
})
