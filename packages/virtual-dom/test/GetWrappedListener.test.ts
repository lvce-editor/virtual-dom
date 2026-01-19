/**
 * @jest-environment jsdom
 */
import { expect, test, jest } from '@jest/globals'

const mockComponentUid = {
  getComponentUidFromEvent: jest.fn(),
}

const mockIpcState = {
  getIpc: jest.fn(),
}

const mockListenerCache = {
  get: jest.fn(),
  has: jest.fn(),
  set: jest.fn(),
}

const mockNameAnonymousFunction = {
  nameAnonymousFunction: jest.fn(),
}

jest.unstable_mockModule(
  '../src/parts/ComponentUid/ComponentUid.ts',
  () => mockComponentUid,
)
jest.unstable_mockModule(
  '../src/parts/IpcState/IpcState.ts',
  () => mockIpcState,
)
jest.unstable_mockModule(
  '../src/parts/ListenerCache/ListenerCache.ts',
  () => mockListenerCache,
)
jest.unstable_mockModule(
  '../src/parts/NameAnonymousFunction/NameAnonymousFunction.ts',
  () => mockNameAnonymousFunction,
)

const { getWrappedListener } =
  await import('../src/parts/GetWrappedListener/GetWrappedListener.ts')

test('getWrappedListener - returns original listener when returnValue is false', () => {
  const originalListener = jest.fn()
  const result = getWrappedListener(originalListener, false)
  expect(result).toBe(originalListener)
})

test('getWrappedListener - returns cached listener when available', () => {
  const originalListener = jest.fn()
  const cachedListener = jest.fn()
  mockListenerCache.has.mockReturnValue(true)
  mockListenerCache.get.mockReturnValue(cachedListener)

  const result = getWrappedListener(originalListener, true)

  expect(mockListenerCache.has).toHaveBeenCalledWith(originalListener)
  expect(mockListenerCache.get).toHaveBeenCalledWith(originalListener)
  expect(result).toBe(cachedListener)
})

test.skip('getWrappedListener - creates and caches new wrapped listener', () => {
  const originalListener = jest.fn()
  const result = getWrappedListener(originalListener, true)
  expect(mockListenerCache.set).toHaveBeenCalledWith(originalListener, result)
})
