/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { renderInternal } from '../src/parts/RenderInternal/RenderInternal.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('renderInternal - renders single element', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
      className: 'test',
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.children.length).toBe(1)
  expect($Parent.firstElementChild?.className).toBe('test')
})

test('renderInternal - renders text node', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      type: VirtualDomElements.Text,
      text: 'Hello World',
      childCount: 0,
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.textContent).toBe('Hello World')
})

test('renderInternal - renders nested elements', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
      className: 'parent',
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
      className: 'child',
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.children.length).toBe(1)
  const $ParentDiv = $Parent.firstElementChild
  expect($ParentDiv?.className).toBe('parent')
  expect($ParentDiv?.children.length).toBe(1)
  expect($ParentDiv?.firstElementChild?.className).toBe('child')
})

test('renderInternal - renders multiple nested elements', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
      className: 'parent',
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
      className: 'child1',
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
      className: 'grandchild',
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
      className: 'child2',
    },
  ]
  renderInternal($Parent, elements, {})

  const $ParentDiv = $Parent.firstElementChild
  expect($ParentDiv?.className).toBe('parent')
  expect($ParentDiv?.children.length).toBe(2)

  const $Child1 = $ParentDiv?.children[0]
  expect($Child1?.className).toBe('child1')
  expect($Child1?.children.length).toBe(1)
  expect($Child1?.firstElementChild?.className).toBe('grandchild')

  const $Child2 = $ParentDiv?.children[1]
  expect($Child2?.className).toBe('child2')
})
