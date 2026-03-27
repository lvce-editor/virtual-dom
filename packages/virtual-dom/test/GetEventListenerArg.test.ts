/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { getEventListenerArg } from '../src/parts/GetEventListenerArg/GetEventListenerArg.ts'

test('getEventListenerArg - event.clipboardData.files returns pasted files array', () => {
  const firstFile = new File(['a'], 'first.txt', {
    type: 'text/plain',
  })
  const secondFile = new File(['b'], 'second.txt', {
    type: 'text/plain',
  })
  const event = {
    clipboardData: {
      items: [
        {
          kind: 'string',
          getAsFile: () => null,
        },
        {
          kind: 'file',
          getAsFile: () => firstFile,
        },
        {
          kind: 'file',
          getAsFile: () => secondFile,
        },
      ],
    },
  }

  const result = getEventListenerArg('event.clipboardData.files', event)

  expect(result).toEqual([firstFile, secondFile])
})

test('getEventListenerArg - event.clipboardData.files returns empty array without clipboard data', () => {
  const result = getEventListenerArg('event.clipboardData.files', {})

  expect(result).toEqual([])
})
