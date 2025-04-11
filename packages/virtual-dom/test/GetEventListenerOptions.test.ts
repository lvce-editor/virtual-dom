import { expect, test } from '@jest/globals'
import { getEventListenerOptions } from '../src/parts/GetEventListenerOptions/GetEventListenerOptions.ts'

test('getEventListenerOptions - returns passive true for wheel event', () => {
  const value = {}
  expect(getEventListenerOptions('wheel', value)).toEqual({
    passive: true,
  })
})

test('getEventListenerOptions - returns undefined for click event', () => {
  const value = {}
  expect(getEventListenerOptions('click', value)).toBeUndefined()
})

test('getEventListenerOptions - returns undefined for unknown event', () => {
  const value = {}
  expect(getEventListenerOptions('unknownEvent', value)).toBeUndefined()
})

test('getEventListenerOptions - returns undefined for empty string', () => {
  const value = {}
  expect(getEventListenerOptions('', value)).toBeUndefined()
})
