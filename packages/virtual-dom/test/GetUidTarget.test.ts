/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { getUidTarget } from '../src/parts/GetUidTarget/GetUidTarget.ts'
import { uidSymbol } from '../src/parts/UidSymbol/UidSymbol.ts'

test('getUidTarget', () => {
  const $Element = document.createElement('div')
  $Element[uidSymbol] = 1
  expect(getUidTarget($Element)).toBe($Element)
})

test('getUidTarget - not found', () => {
  const $Element = document.createElement('div')
  expect(getUidTarget($Element)).toBe(undefined)
})

test('getUidTarget - parent node', () => {
  const $Element = document.createElement('div')
  $Element[uidSymbol] = 2
  const $Child = document.createElement('div')
  $Element.append($Child)
  expect(getUidTarget($Child)).toBe($Element)
})
