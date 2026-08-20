import assert from 'node:assert/strict'
import { test } from 'node:test'
import { parseUrl } from './parseUrl.ts'

void test('parseUrl resolves a relative URL against its base', () => {
  assert.equal(
    parseUrl('/tests/_all.html', 'http://127.0.0.1:3000').href,
    'http://127.0.0.1:3000/tests/_all.html',
  )
})

void test('parseUrl rejects an invalid URL', () => {
  assert.throws(
    () => parseUrl('/tests/_all.html', 'invalid'),
    new TypeError('Invalid URL: /tests/_all.html with base invalid'),
  )
})
