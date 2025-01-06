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

test('diff - button to input conversion', () => {
  const oldNode = {
    type: VirtualDomElements.Button,
    className: 'btn',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Input,
    className: 'input',
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

test('diff - same text content should not generate patches', () => {
  const oldNode = text('hello')
  const newNode = text('hello')
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([])
})

test.skip('diff - multiple text nodes in sequence', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    text('hello'),
    text('world'),
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    text('hi'),
    text('earth'),
  ]
  const patches = diff(oldNodes[0], newNodes[0])
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 1,
      value: 'hi',
    },
    {
      type: PatchType.SetText,
      index: 2,
      value: 'earth',
    },
  ])
})

test.skip('diff - table structure', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Table,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Tr,
      childCount: 1,
    },
    text('old'),
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Table,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Tr,
      childCount: 1,
    },
    text('new'),
  ]
  const patches = diff(oldNodes[0], newNodes[0])
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 2,
      value: 'new',
    },
  ])
})

test.skip('diff - deep nested structure', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    text('deep'),
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    text('deeper'),
  ]
  const patches = diff(oldNodes[0], newNodes[0])
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 3,
      value: 'deeper',
    },
  ])
})

test.skip('diff - node with multiple children', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    text('one'),
    text('two'),
    text('three'),
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    text('uno'),
    text('dos'),
    text('tres'),
  ]
  const patches = diff(oldNodes[0], newNodes[0])
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      index: 1,
      value: 'uno',
    },
    {
      type: PatchType.SetText,
      index: 2,
      value: 'dos',
    },
    {
      type: PatchType.SetText,
      index: 3,
      value: 'tres',
    },
  ])
})

test('diff - add data attributes', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    'data-testid': 'test',
    'data-value': '123',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'data-testid',
      value: 'test',
    },
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'data-value',
      value: '123',
    },
  ])
})

test('diff - change element with ARIA attributes', () => {
  const oldNode = {
    type: VirtualDomElements.Button,
    'aria-label': 'Old Label',
    'aria-expanded': false,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Button,
    'aria-label': 'New Label',
    'aria-expanded': true,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'aria-label',
      value: 'New Label',
    },
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'aria-expanded',
      value: true,
    },
  ])
})

test('diff - form elements', () => {
  const oldNode = {
    type: VirtualDomElements.Input,
    value: 'old',
    inputType: 'text',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Input,
    value: 'new',
    inputType: 'password',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'value',
      value: 'new',
    },
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'inputType',
      value: 'password',
    },
  ])
})
