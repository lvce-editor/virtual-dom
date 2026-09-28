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
      childCount: 0,
      className: 'test',
      type: VirtualDomElements.Div,
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.children).toHaveLength(1)
  expect($Parent.firstElementChild?.className).toBe('test')
})

test('renderInternal - renders text node', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      childCount: 0,
      text: 'Hello World',
      type: VirtualDomElements.Text,
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.textContent).toBe('Hello World')
})

test('renderInternal - renders nested elements', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      childCount: 1,
      className: 'parent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'child',
      type: VirtualDomElements.Div,
    },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.children).toHaveLength(1)
  const $ParentDiv = $Parent.firstElementChild
  expect($ParentDiv?.className).toBe('parent')
  expect($ParentDiv?.children).toHaveLength(1)
  expect($ParentDiv?.firstElementChild?.className).toBe('child')
})

test('renderInternal - renders multiple nested elements', () => {
  const $Parent = document.createElement('div')
  const elements = [
    {
      childCount: 2,
      className: 'parent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'child1',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'grandchild',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      className: 'child2',
      type: VirtualDomElements.Div,
    },
  ]
  renderInternal($Parent, elements, {})

  const $ParentDiv = $Parent.firstElementChild
  expect($ParentDiv?.className).toBe('parent')
  expect($ParentDiv?.children).toHaveLength(2)

  const $Child1 = $ParentDiv?.children[0]
  expect($Child1?.className).toBe('child1')
  expect($Child1?.children).toHaveLength(1)
  expect($Child1?.firstElementChild?.className).toBe('grandchild')

  const $Child2 = $ParentDiv?.children[1]
  expect($Child2?.className).toBe('child2')
})

test('renderInternal - preserves root and nested sibling order', () => {
  const $Parent = document.createElement('div')
  const elements = [
    { type: VirtualDomElements.Text, childCount: 0, text: 'before' },
    { type: VirtualDomElements.Div, childCount: 2 },
    { type: VirtualDomElements.Text, childCount: 0, text: 'first' },
    { type: VirtualDomElements.Span, childCount: 1 },
    { type: VirtualDomElements.Text, childCount: 0, text: 'second' },
    { type: VirtualDomElements.Text, childCount: 0, text: 'after' },
  ]
  renderInternal($Parent, elements, {})
  expect($Parent.innerHTML).toBe(
    'before<div>first<span>second</span></div>after',
  )
})

test('renderInternal - renders a wide tree without spreading children as arguments', () => {
  const $Parent = document.createElement('div')
  const count = 150_000
  const elements = [
    { type: VirtualDomElements.Div, childCount: count },
    ...Array.from({ length: count }, (_, index) => ({
      type: VirtualDomElements.Text,
      childCount: 0,
      text: String(index),
    })),
  ]
  renderInternal($Parent, elements, {})
  const $Root = $Parent.firstElementChild!
  expect($Root.childNodes).toHaveLength(count)
  expect($Root.firstChild?.textContent).toBe('0')
  expect($Root.lastChild?.textContent).toBe(String(count - 1))
})
