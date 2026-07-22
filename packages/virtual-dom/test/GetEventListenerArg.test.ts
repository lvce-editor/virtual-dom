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
          getAsFile: (): null => null,
        },
        {
          kind: 'file',
          getAsFile: (): File => firstFile,
        },
        {
          kind: 'file',
          getAsFile: (): File => secondFile,
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

test('getEventListenerArg - event.target.name returns the target name', () => {
  const button = document.createElement('button')
  button.name = 'refresh'

  const result = getEventListenerArg('event.target.name', { target: button })

  expect(result).toBe('refresh')
})

test('getEventListenerArg - event.target.name returns the named button for an icon click', () => {
  const button = document.createElement('button')
  button.name = 'refresh'
  const icon = document.createElement('span')
  icon.className = 'MaskIcon'
  button.append(icon)

  const result = getEventListenerArg('event.target.name', { target: icon })

  expect(result).toBe('refresh')
})

test('getEventListenerArg - event.target.name returns the named button for a deeply nested icon click', () => {
  const button = document.createElement('button')
  button.name = 'refresh'
  const icon = document.createElement('span')
  const iconDecoration = document.createElement('span')
  icon.append(iconDecoration)
  button.append(icon)

  const result = getEventListenerArg('event.target.name', {
    target: iconDecoration,
  })

  expect(result).toBe('refresh')
})

test('getEventListenerArg - event.target.name uses the nearest named ancestor', () => {
  const outer = document.createElement('div')
  outer.setAttribute('name', 'outer')
  const button = document.createElement('button')
  button.name = 'inner'
  const icon = document.createElement('span')
  button.append(icon)
  outer.append(button)

  const result = getEventListenerArg('event.target.name', { target: icon })

  expect(result).toBe('inner')
})

test('getEventListenerArg - event.target.name returns an empty string without a named target', () => {
  const icon = document.createElement('span')

  const result = getEventListenerArg('event.target.name', { target: icon })

  expect(result).toBe('')
})

test('getEventListenerArg - event.target.name does not escape the event listener root', () => {
  const namedOuter = document.createElement('div')
  namedOuter.setAttribute('name', 'outer')
  const eventRoot = document.createElement('div')
  const icon = document.createElement('span')
  eventRoot.append(icon)
  namedOuter.append(eventRoot)

  const result = getEventListenerArg('event.target.name', {
    currentTarget: eventRoot,
    target: icon,
  })

  expect(result).toBe('')
})

test('getEventListenerArg - event.target.name supports a non-DOM event target', () => {
  const result = getEventListenerArg('event.target.name', {
    target: {
      name: 'refresh',
    },
  })

  expect(result).toBe('refresh')
})
