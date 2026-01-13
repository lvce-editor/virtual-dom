/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import {
  getComponentUid,
  getComponentUidFromEvent,
  setComponentUid,
} from '../src/parts/ComponentUid/ComponentUid.ts'
import { uidSymbol } from '../src/parts/UidSymbol/UidSymbol.ts'

test('setComponentUid - sets uid on element', () => {
  const $Element = document.createElement('div')
  setComponentUid($Element, 123)
  expect($Element[uidSymbol]).toBe(123)
})

test('getComponentUid - returns 0 when no uid target found', () => {
  const $Element = document.createElement('div')
  expect(getComponentUid($Element)).toBe(0)
})

test('getComponentUid - returns uid from element', () => {
  const $Element = document.createElement('div')
  setComponentUid($Element, 456)
  expect(getComponentUid($Element)).toBe(456)
})

test('getComponentUid - returns uid from parent element', () => {
  const $Parent = document.createElement('div')
  const $Child = document.createElement('span')
  $Parent.append($Child)
  setComponentUid($Parent, 789)
  expect(getComponentUid($Child)).toBe(789)
})

test('getComponentUidFromEvent - gets uid from event target', () => {
  const $Element = document.createElement('div')
  setComponentUid($Element, 101)
  const event = {
    target: $Element,
  }
  expect(getComponentUidFromEvent(event)).toBe(101)
})

test('getComponentUidFromEvent - gets uid from currentTarget if available', () => {
  const $Target = document.createElement('div')
  const $CurrentTarget = document.createElement('div')
  setComponentUid($Target, 102)
  setComponentUid($CurrentTarget, 103)
  const event = {
    currentTarget: $CurrentTarget,
    target: $Target,
  }
  expect(getComponentUidFromEvent(event)).toBe(103)
})
