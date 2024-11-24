import { expect, test } from '@jest/globals'
import { getEventListenerOptions } from '../src/parts/GetEventListenerOptions/GetEventListenerOptions.ts'

test('getEventListenerOptions - returns passive true for wheel event', () => {
  expect(getEventListenerOptions('wheel')).toEqual({
    passive: true,
  })
})

test('getEventListenerOptions - returns undefined for click event', () => {
  expect(getEventListenerOptions('click')).toBeUndefined()
})

test('getEventListenerOptions - returns undefined for unknown event', () => {
  expect(getEventListenerOptions('unknownEvent')).toBeUndefined()
})

test('getEventListenerOptions - returns undefined for empty string', () => {
  expect(getEventListenerOptions('')).toBeUndefined()
})
