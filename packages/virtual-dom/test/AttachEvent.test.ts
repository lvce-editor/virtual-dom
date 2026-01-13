/**
 * @jest-environment jsdom
 */
import { expect, test, jest, beforeEach } from '@jest/globals'

const mockGetEventListenerOptions = {
  getEventListenerOptions: jest.fn(),
}

const mockGetWrappedListener = {
  getWrappedListener: jest.fn(),
}

jest.unstable_mockModule(
  '../src/parts/GetEventListenerOptions/GetEventListenerOptions.ts',
  () => mockGetEventListenerOptions,
)
jest.unstable_mockModule(
  '../src/parts/GetWrappedListener/GetWrappedListener.ts',
  () => mockGetWrappedListener,
)

const { attachEvent } = await import('../src/parts/AttachEvent/AttachEvent.ts')

beforeEach(() => {
  jest.resetAllMocks()
})

test('attachEvent - attaches event listener with correct parameters', () => {
  const $Element = document.createElement('div')
  const mockListener = jest.fn()
  const mockWrappedListener = jest.fn()
  const eventMap = {
    returnValue: false,
    'test-handler': mockListener,
  }

  mockGetWrappedListener.getWrappedListener.mockReturnValue(mockWrappedListener)
  jest.spyOn($Element, 'addEventListener')

  attachEvent($Element, eventMap, 'click', 'test-handler')

  expect(mockGetWrappedListener.getWrappedListener).toHaveBeenCalledWith(
    mockListener,
    false,
  )
  expect($Element.addEventListener).toHaveBeenCalledWith(
    'click',
    mockWrappedListener,
    undefined,
  )
})

test('attachEvent - handles missing listener', () => {
  const $Element = document.createElement('div')
  const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
  const eventMap = {}

  attachEvent($Element, eventMap, 'click', 'missing-handler')

  expect(consoleSpy).toHaveBeenCalledWith(
    'listener not found',
    'missing-handler',
  )
  consoleSpy.mockRestore()
})

test('attachEvent - uses event options from GetEventListenerOptions', () => {
  const $Element = document.createElement('div')
  const mockListener = jest.fn()
  const mockWrappedListener = jest.fn()
  const eventMap = {
    returnValue: true,
    'test-handler': mockListener,
  }
  const mockOptions = { passive: true }

  mockGetEventListenerOptions.getEventListenerOptions.mockReturnValue(
    mockOptions,
  )
  mockGetWrappedListener.getWrappedListener.mockReturnValue(mockWrappedListener)
  jest.spyOn($Element, 'addEventListener')

  attachEvent($Element, eventMap, 'wheel', 'test-handler')

  expect(
    mockGetEventListenerOptions.getEventListenerOptions,
  ).toHaveBeenCalledWith('wheel', 'test-handler')
  expect($Element.addEventListener).toHaveBeenCalledWith(
    'wheel',
    mockWrappedListener,
    mockOptions,
  )
})
