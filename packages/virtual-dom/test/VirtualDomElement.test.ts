/**
 * @jest-environment jsdom
 */
import { expect, jest, test } from '@jest/globals'
import * as VirtualDomElement from '../src/parts/VirtualDomElement/VirtualDomElement.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('render - creates text node', () => {
  const element = {
    type: VirtualDomElements.Text,
    text: 'Hello World',
  }
  const result = VirtualDomElement.render(element, {})
  expect(result).toBeInstanceOf(Text)
  expect(result.textContent).toBe('Hello World')
})

test('render - creates DOM element with props', () => {
  const element = {
    type: VirtualDomElements.Div,
    className: 'test-class',
    id: 'test-id',
  }
  const result = VirtualDomElement.render(element, {})
  expect(result).toBeInstanceOf(HTMLDivElement)
  // @ts-ignore
  expect(result.className).toBe('test-class')
  // @ts-ignore
  expect(result.id).toBe('test-id')
})

test('render - creates input element with type', () => {
  const element = {
    type: VirtualDomElements.Input,
    inputType: 'checkbox',
    checked: true,
  }
  const result = VirtualDomElement.render(element, {})
  expect(result).toBeInstanceOf(HTMLInputElement)
  // @ts-ignore
  expect(result.type).toBe('checkbox')
  // @ts-ignore
  expect(result.checked).toBe(true)
})

test('render - creates element with event listeners', () => {
  const mockHandler = jest.fn()
  const eventMap = {
    'test-handler': mockHandler,
  }
  const element = {
    type: VirtualDomElements.Button,
    onClick: 'test-handler',
  }
  const result = VirtualDomElement.render(element, eventMap)
  expect(result).toBeInstanceOf(HTMLButtonElement)
  // @ts-ignore
  result.click()
  expect(mockHandler).toHaveBeenCalled()
})
