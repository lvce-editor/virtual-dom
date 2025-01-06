import { expect, test } from '@jest/globals'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import { diff } from '../src/parts/VirtualDomDiff/VirtualDomDiff.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('diff - text node changed', () => {
  const oldNode = text('hello')
  const newNode = text('world')
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 0,
      value: 'world',
    },
  ])
})

test('diff - attribute changed', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - attribute removed', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'className',
    },
  ])
})

test.skip('diff - nested nodes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 1,
    children: [text('hello')],
  }
  const newNode = {
    type: VirtualDomElements.Div,
    childCount: 1,
    children: [text('world')],
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 1,
      value: 'world',
    },
  ])
})

test('diff - multiple attributes changed', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    id: 'old-id',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    id: 'new-id',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'className',
      value: 'new-class',
    },
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'id',
      value: 'new-id',
    },
  ])
})

test('diff - empty nodes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([])
})

test('diff - node type changed from div to span', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Span,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.Replace,
      index: 0,
      node: newNode,
    },
  ])
})

test('diff - add new attribute', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - remove all attributes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    id: 'old-id',
    title: 'old-title',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'className',
    },
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'id',
    },
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'title',
    },
  ])
})

test('diff - change node type with attributes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Span,
    id: 'new-id',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.Replace,
      index: 0,
      node: newNode,
    },
  ])
})

test('diff - empty text to non-empty text', () => {
  const oldNode = text('')
  const newNode = text('hello')
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 0,
      value: 'hello',
    },
  ])
})

test('diff - text node to div node', () => {
  const oldNode = text('hello')
  const newNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.Replace,
      index: 0,
      node: newNode,
    },
  ])
})

test('diff - same attribute values should not generate patches', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'same-class',
    id: 'same-id',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'same-class',
    id: 'same-id',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([])
})

test('diff - mixed attribute changes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'keep-class',
    id: 'old-id',
    title: 'to-remove',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'keep-class',
    id: 'new-id',
    'data-new': 'added',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'id',
      value: 'new-id',
    },
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'data-new',
      value: 'added',
    },
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'title',
    },
  ])
})
