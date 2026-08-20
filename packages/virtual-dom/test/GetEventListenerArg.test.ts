/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { acquire } from '../src/parts/DropData/DropData.ts'
import { getFileHandles } from '../src/parts/FileHandles/FileHandles.ts'
import { getEventListenerArg } from '../src/parts/GetEventListenerArg/GetEventListenerArg.ts'

test('getEventListenerArg - event.dropId retains ordered drop data', async () => {
  const file = new File(['content'], 'notes.txt', { type: 'text/plain' })
  const handle = { kind: 'file', name: 'notes.txt' }
  let resolveString: ((value: string) => void) | undefined
  const event = {
    dataTransfer: {
      items: [
        {
          getAsString(callback: (value: string) => void): void {
            resolveString = callback
          },
          kind: 'string',
          type: 'text/plain',
        },
        {
          getAsFile: (): File => file,
          getAsFileSystemHandle: (): Promise<typeof handle> =>
            Promise.resolve(handle),
          kind: 'file',
          type: 'text/plain',
        },
      ],
    },
    type: 'drop',
  }

  const dropId = getEventListenerArg('event.dropId', event)
  resolveString?.('hello')
  const items = acquire(dropId)

  if (items[0].kind !== 'string') {
    throw new Error('Expected string item')
  }
  expect(await items[0].value).toBe('hello')
  expect(items[0]).toMatchObject({
    index: 0,
    kind: 'string',
    type: 'text/plain',
  })
  expect(items[1]).toMatchObject({
    file,
    index: 1,
    kind: 'file',
    type: 'text/plain',
  })
  if (items[1].kind !== 'file') {
    throw new Error('Expected file item')
  }
  await expect(items[1].fileSystemHandle).resolves.toEqual(handle)
})

test('getEventListenerArg - event.dropId is unique and one-shot', () => {
  const event = { dataTransfer: { items: [] }, type: 'drop' }
  const first = getEventListenerArg('event.dropId', event)
  const second = getEventListenerArg('event.dropId', event)

  expect(first).not.toBe(second)
  expect(acquire(first)).toEqual([])
  expect(() => acquire(first)).toThrow('Drop data not found')
  expect(acquire(second)).toEqual([])
})

test('getEventListenerArg - event.dropId is only available for drops', () => {
  expect(() =>
    getEventListenerArg('event.dropId', { type: 'dragover' }),
  ).toThrow('event.dropId is only available for drop events')
})

test('getEventListenerArg - data transfer ids retain the native file alongside the file system handle', async () => {
  const file = new File(['content'], 'notes.txt', { type: 'text/plain' })
  const handle = { kind: 'file', name: 'notes.txt' }
  const event = {
    dataTransfer: {
      items: [
        {
          getAsFile: (): File => file,
          getAsFileSystemHandle: async (): Promise<typeof handle> => handle,
          kind: 'file',
          type: 'text/plain',
        },
      ],
    },
  }

  const ids = getEventListenerArg('event.dataTransfer.files2', event)

  await expect(getFileHandles(ids)).resolves.toEqual([
    { file, kind: 'file', type: 'text/plain', value: handle },
  ])
})

test('getEventListenerArg - reads the native file before the drag data store expires', async () => {
  const file = new File(['content'], 'notes.txt', { type: 'text/plain' })
  const handle = { kind: 'file', name: 'notes.txt' }
  let dataStoreExpired = false
  const event = {
    dataTransfer: {
      items: [
        {
          getAsFile: (): File | null => (dataStoreExpired ? null : file),
          getAsFileSystemHandle: async (): Promise<typeof handle> => {
            await Promise.resolve()
            dataStoreExpired = true
            return handle
          },
          kind: 'file',
          type: 'text/plain',
        },
      ],
    },
  }

  const ids = getEventListenerArg('event.dataTransfer.files2', event)

  await expect(getFileHandles(ids)).resolves.toEqual([
    { file, kind: 'file', type: 'text/plain', value: handle },
  ])
})

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

test('getEventListenerArg - clipboard data ids retain native files', async () => {
  const file = new File(['content'], 'Main.elm', { type: 'text/plain' })
  const event = {
    clipboardData: {
      items: [
        {
          getAsFile: (): File => file,
          kind: 'file',
          type: 'text/plain',
        },
        {
          kind: 'string',
          type: 'text/plain',
        },
      ],
    },
  }

  const ids = getEventListenerArg('event.clipboardData.files2', event)

  await expect(getFileHandles(ids)).resolves.toEqual([
    { kind: 'file-legacy', type: 'text/plain', value: file },
  ])
})

test('getEventListenerArg - clipboard data ids are empty without clipboard data', () => {
  expect(getEventListenerArg('event.clipboardData.files2', {})).toEqual([])
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

test('getEventListenerArg - returns nested event target values', () => {
  const event = {
    target: {
      currentTime: 12.5,
      error: {
        code: 4,
        message: 'Format error',
      },
    },
  }

  expect(getEventListenerArg('event.target.currentTime', event)).toBe(12.5)
  expect(getEventListenerArg('event.target.error.code', event)).toBe(4)
  expect(getEventListenerArg('event.target.error.message', event)).toBe(
    'Format error',
  )
})

test('getEventListenerArg - returns undefined when a nested event target value is missing', () => {
  const event = {
    target: {},
  }

  expect(getEventListenerArg('event.target.error.code', event)).toBeUndefined()
})
