import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import type { VirtualDomNode } from '../src/parts/VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import * as CompareNodes from '../src/parts/VirtualDomDiffTree/CompareNodes.ts'
import { text } from '../src/parts/Text/Text.ts'

test('compareNodes - identical nodes', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([])
})

test('compareNodes - node type changed', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Span,
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [newNode],
    },
  ])
})

test('compareNodes - text node changed', () => {
  const oldNode = text('hello')
  const newNode = text('world')
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('compareNodes - text node unchanged', () => {
  const oldNode = text('hello')
  const newNode = text('hello')
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([])
})

test('compareNodes - attribute added', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('compareNodes - attribute changed', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('compareNodes - attribute removed', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      key: 'className',
    },
  ])
})

test('compareNodes - multiple attributes changed', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    id: 'old-id',
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    id: 'new-id',
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
    {
      type: PatchType.SetAttribute,
      key: 'id',
      value: 'new-id',
    },
  ])
})

test('compareNodes - mixed attribute changes', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'keep-class',
    id: 'old-id',
    title: 'to-remove',
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    className: 'keep-class',
    id: 'new-id',
    'data-new': 'added',
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'id',
      value: 'new-id',
    },
    {
      type: PatchType.SetAttribute,
      key: 'data-new',
      value: 'added',
    },
    {
      type: PatchType.RemoveAttribute,
      key: 'title',
    },
  ])
})

test('compareNodes - data attributes', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Div,
    'data-testid': 'test',
    'data-value': '123',
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'data-testid',
      value: 'test',
    },
    {
      type: PatchType.SetAttribute,
      key: 'data-value',
      value: '123',
    },
  ])
})

test('compareNodes - ARIA attributes', () => {
  const oldNode: VirtualDomNode = {
    type: VirtualDomElements.Button,
    'aria-label': 'Old Label',
    'aria-expanded': false,
    childCount: 0,
  }
  const newNode: VirtualDomNode = {
    type: VirtualDomElements.Button,
    'aria-label': 'New Label',
    'aria-expanded': true,
    childCount: 0,
  }
  const patches = CompareNodes.compareNodes(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'aria-label',
      value: 'New Label',
    },
    {
      type: PatchType.SetAttribute,
      key: 'aria-expanded',
      value: true,
    },
  ])
})
