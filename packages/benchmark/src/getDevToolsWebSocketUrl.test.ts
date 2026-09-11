import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test, type TestContext } from 'node:test'
import { setTimeout } from 'node:timers/promises'
import { getDevToolsWebSocketUrl } from './getDevToolsWebSocketUrl.ts'

const createProfile = async (context: TestContext): Promise<string> => {
  const path = await mkdtemp(join(tmpdir(), 'virtual-dom-devtools-'))
  context.after(async () => {
    await rm(path, { force: true, recursive: true })
  })
  return path
}

const writeEndpointLater = async (
  filePath: string,
  content: string,
): Promise<void> => {
  await setTimeout(100)
  await writeFile(filePath, content)
}

void test('reads an existing DevTools endpoint', async (context) => {
  const profile = await createProfile(context)
  await writeFile(
    join(profile, 'DevToolsActivePort'),
    '9222\n/devtools/browser/test',
  )
  assert.equal(
    await getDevToolsWebSocketUrl(profile),
    'ws://127.0.0.1:9222/devtools/browser/test',
  )
})

void test('waits for Chromium to create its DevTools endpoint file', async (context) => {
  const profile = await createProfile(context)
  const endpoint = getDevToolsWebSocketUrl(profile)
  const writer = writeEndpointLater(
    join(profile, 'DevToolsActivePort'),
    '9223\n/devtools/browser/delayed',
  )
  const [result] = await Promise.allSettled([endpoint, writer])
  assert.deepEqual(result, {
    status: 'fulfilled',
    value: 'ws://127.0.0.1:9223/devtools/browser/delayed',
  })
})

void test('waits for both lines of a partially written endpoint', async (context) => {
  const profile = await createProfile(context)
  const filePath = join(profile, 'DevToolsActivePort')
  await writeFile(filePath, '9224\n')
  const endpoint = getDevToolsWebSocketUrl(profile)
  const writer = writeEndpointLater(
    filePath,
    '9224\n/devtools/browser/complete',
  )
  const [result] = await Promise.allSettled([endpoint, writer])
  assert.deepEqual(result, {
    status: 'fulfilled',
    value: 'ws://127.0.0.1:9224/devtools/browser/complete',
  })
})

void test('accepts CRLF line endings in the endpoint file', async (context) => {
  const profile = await createProfile(context)
  await writeFile(
    join(profile, 'DevToolsActivePort'),
    '9225\r\n/devtools/browser/crlf\r\n',
  )
  assert.equal(
    await getDevToolsWebSocketUrl(profile),
    'ws://127.0.0.1:9225/devtools/browser/crlf',
  )
})

void test('fails within the deadline when Chrome never creates the file', async (context) => {
  const profile = await createProfile(context)
  await assert.rejects(
    getDevToolsWebSocketUrl(profile, 0),
    /Timed out waiting for Chrome to write .*DevToolsActivePort/,
  )
})

void test('fails within the deadline when the endpoint stays incomplete', async (context) => {
  const profile = await createProfile(context)
  await writeFile(join(profile, 'DevToolsActivePort'), '9226\n')
  await assert.rejects(
    getDevToolsWebSocketUrl(profile, 0),
    /Timed out waiting for Chrome to write .*DevToolsActivePort/,
  )
})

void test('propagates file errors other than a missing endpoint', async (context) => {
  const profile = await createProfile(context)
  await mkdir(join(profile, 'DevToolsActivePort'))
  await assert.rejects(getDevToolsWebSocketUrl(profile), { code: 'EISDIR' })
})
