/**
 * @jest-environment jsdom
 */
import { expect, jest, test } from '@jest/globals'
import * as Instances from '../src/parts/Instances/Instances.ts'
import * as VirtualDomElement from '../src/parts/VirtualDomElement/VirtualDomElement.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('render - creates text node', () => {
  const element = {
    text: 'Hello World',
    type: VirtualDomElements.Text,
  }
  const result = VirtualDomElement.render(element, {})
  expect(result).toBeInstanceOf(Text)
  expect(result.textContent).toBe('Hello World')
})

test('render - creates DOM element with props', () => {
  const element = {
    className: 'test-class',
    id: 'test-id',
    type: VirtualDomElements.Div,
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
    checked: true,
    inputType: 'checkbox',
    type: VirtualDomElements.Input,
  }
  const result = VirtualDomElement.render(element, {})
  expect(result).toBeInstanceOf(HTMLInputElement)
  // @ts-ignore
  expect(result.type).toBe('checkbox')
  // @ts-ignore
  expect(result.checked).toBe(true)
})

test.each([
  [VirtualDomElements.Svg, 'svg'],
  [VirtualDomElements.Rect, 'rect'],
  [VirtualDomElements.Polygon, 'polygon'],
  [VirtualDomElements.Path, 'path'],
  [VirtualDomElements.Circle, 'circle'],
])('render - creates SVG element %s as <%s>', (type, tagName) => {
  const result = VirtualDomElement.render(
    { childCount: 0, type },
    {},
  ) as Element

  expect(result.namespaceURI).toBe('http://www.w3.org/2000/svg')
  expect(result.nodeName.toLowerCase()).toBe(tagName)
})

test('render - applies SVG attributes', () => {
  const result = VirtualDomElement.render(
    {
      childCount: 0,
      fill: 'red',
      points: '0,0 10,0 5,10',
      'stroke-width': '2',
      type: VirtualDomElements.Polygon,
    },
    {},
  ) as Element

  expect(result.getAttribute('fill')).toBe('red')
  expect(result.getAttribute('points')).toBe('0,0 10,0 5,10')
  expect(result.getAttribute('stroke-width')).toBe('2')
})

test('render - creates element with event listeners', () => {
  const mockHandler = jest.fn()
  const eventMap = {
    'test-handler': mockHandler,
  }
  const element = {
    onClick: 'test-handler',
    type: VirtualDomElements.Button,
  }
  const result = VirtualDomElement.render(element, eventMap)
  expect(result).toBeInstanceOf(HTMLButtonElement)
  // @ts-ignore
  result.click()
  expect(mockHandler).toHaveBeenCalled()
})

test('render - applies props to a reference node', () => {
  const canvas = document.createElement('canvas')
  Instances.set(42, {
    state: {
      $Viewlet: canvas,
    },
  })
  const element = {
    'aria-label': 'Live tree',
    className: 'TreeCanvas',
    'data-preview': 'tree',
    id: 'tree',
    type: VirtualDomElements.Reference,
    uid: 42,
  }

  const result = VirtualDomElement.render(element, {})

  expect(result).toBe(canvas)
  expect(canvas.id).toBe('tree')
  expect(canvas.className).toBe('TreeCanvas')
  expect(canvas.dataset.preview).toBe('tree')
  expect(canvas.getAttribute('aria-label')).toBe('Live tree')
})
