/**
 * @jest-environment jsdom
 */
import { expect, jest, test } from '@jest/globals'
import { createFn } from '../src/parts/CreateEventListenerFunction/CreateEventListenerFunction.ts'

const getAddedListener = (
  addEventListener: any,
  type: string,
): EventListener => {
  const call = addEventListener.mock.calls.find(
    ([eventType]) => eventType === type,
  )
  expect(call).toBeDefined()
  return call?.[1] as EventListener
}

const createPointerTrack = (): {
  readonly addEventListener: any
  readonly pointerMove: jest.Mock
  readonly pointerUp: jest.Mock
  readonly removeEventListener: any
  readonly target: HTMLDivElement
} => {
  const pointerMove = jest.fn()
  const pointerUp = jest.fn()
  const target = document.createElement('div')
  target.setPointerCapture = jest.fn()
  const addEventListener = jest.spyOn(target, 'addEventListener')
  const removeEventListener = jest.spyOn(target, 'removeEventListener')
  const fn = createFn(
    {
      name: 1,
      params: [],
      trackPointerEvents: [2, 3],
    },
    {
      2: pointerMove,
      3: pointerUp,
    },
  )

  fn({
    currentTarget: target,
    pointerId: 7,
    target,
  })

  return {
    addEventListener,
    pointerMove,
    pointerUp,
    removeEventListener,
    target,
  }
}

test('createFn - removes tracked pointer listeners on pointerup', () => {
  const {
    addEventListener,
    pointerMove,
    pointerUp,
    removeEventListener,
    target,
  } = createPointerTrack()
  const pointerUpListener = getAddedListener(addEventListener, 'pointerup')
  const lostPointerCaptureListener = getAddedListener(
    addEventListener,
    'lostpointercapture',
  )

  pointerUpListener(new Event('pointerup'))

  expect(pointerUp).toHaveBeenCalledTimes(1)
  expect(removeEventListener).toHaveBeenCalledWith('pointermove', pointerMove)
  expect(removeEventListener).toHaveBeenCalledWith(
    'pointerup',
    pointerUpListener,
  )
  expect(removeEventListener).toHaveBeenCalledWith(
    'lostpointercapture',
    lostPointerCaptureListener,
  )
  expect(target.setPointerCapture).toHaveBeenCalledWith(7)
})

test('createFn - removes tracked pointer listeners on lostpointercapture', () => {
  const { addEventListener, pointerMove, pointerUp, removeEventListener } =
    createPointerTrack()
  const pointerUpListener = getAddedListener(addEventListener, 'pointerup')
  const lostPointerCaptureListener = getAddedListener(
    addEventListener,
    'lostpointercapture',
  )

  lostPointerCaptureListener(new Event('lostpointercapture'))

  expect(pointerUp).toHaveBeenCalledTimes(1)
  expect(removeEventListener).toHaveBeenCalledWith('pointermove', pointerMove)
  expect(removeEventListener).toHaveBeenCalledWith(
    'pointerup',
    pointerUpListener,
  )
  expect(removeEventListener).toHaveBeenCalledWith(
    'lostpointercapture',
    lostPointerCaptureListener,
  )
})
