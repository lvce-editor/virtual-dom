import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import { diffTree } from '../src/parts/VirtualDomDiffTree/VirtualDomDiffTree.ts'

test('diffTree - text node changed', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('world')]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diffTree - inner text node changed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: 'Initial Text',
      childCount: 0,
    },
  ]

  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: 'Updated Text',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'Updated Text',
    },
  ])
})

test('diffTree - attribute changed 1', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'old-class',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'new-class',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diffTree - attribute removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'old-class',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      key: 'className',
    },
  ])
})

test('diffTree - nested nodes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    text('hello'),
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    text('world'),
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diffTree - multiple attributes changed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'old-class',
      id: 'old-id',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'new-class',
      id: 'new-id',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
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

test('diffTree - empty nodes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diffTree - node type changed from div to span', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Span,
          childCount: 0,
        },
      ],
    },
  ])
})

test('diffTree - add new attribute', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'new-class',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diffTree - remove all attributes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'old-class',
      id: 'old-id',
      title: 'old-title',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      key: 'className',
    },
    {
      type: PatchType.RemoveAttribute,
      key: 'id',
    },
    {
      type: PatchType.RemoveAttribute,
      key: 'title',
    },
  ])
})

test('diffTree - same attribute values should not generate patches', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'same-class',
      id: 'same-id',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'same-class',
      id: 'same-id',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diffTree - same text content should not generate patches', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('hello')]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diffTree - add data attributes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      'data-testid': 'test',
      'data-value': '123',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
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

test('diffTree - change element with ARIA attributes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Button,
      'aria-label': 'Old Label',
      'aria-expanded': false,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Button,
      'aria-label': 'New Label',
      'aria-expanded': true,
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
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

test('diffTree - form elements', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Input,
      value: 'old',
      inputType: 'text',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Input,
      value: 'new',
      inputType: 'password',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'value',
      value: 'new',
    },
    {
      type: PatchType.SetAttribute,
      key: 'inputType',
      value: 'password',
    },
  ])
})

test('diffTree - mixed attribute changes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'keep-class',
      id: 'old-id',
      title: 'to-remove',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      className: 'keep-class',
      id: 'new-id',
      'data-new': 'added',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
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

test('diffTree - button to input conversion', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Button,
      className: 'btn',
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Input,
      className: 'input',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Input,
          className: 'input',
          childCount: 0,
        },
      ],
    },
  ])
})

test('diffTree - multiple text nodes in sequence', () => {
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
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'hi',
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetText,
      value: 'earth',
    },
  ])
})

test.skip('diffTree - table structure', () => {
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
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'new',
    },
  ])
})

test.skip('diffTree - deep nested structure', () => {
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
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'deeper',
    },
  ])
})

test('diffTree - node with multiple children', () => {
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
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'uno',
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetText,
      value: 'dos',
    },
    {
      type: PatchType.NavigateSibling,
      index: 2,
    },
    {
      type: PatchType.SetText,
      value: 'tres',
    },
  ])
})

test.only('diffTree - add child nodes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: 'First',
      childCount: 0,
    },
  ]

  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: 'First',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: 'Second',
      childCount: 0,
    },
  ]
  const patches = diffTree(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: 7,
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      nodes: [
        {
          childCount: 1,
          type: 8,
        },
      ],
      type: 6,
    },
    {
      index: 0,
      type: 7,
    },
    {
      nodes: [
        {
          childCount: 0,
          text: 'Second',
          type: 12,
        },
      ],
      type: 6,
    },
    {
      type: 8,
    },
    {
      type: 8,
    },
    {
      index: 1,
      type: 10,
    },
    {
      index: 0,
      type: 9,
    },
    {
      nodes: [
        {
          childCount: 1,
          type: 8,
        },
      ],
      type: 6,
    },
    {
      index: 0,
      type: 7,
    },
    {
      nodes: [
        {
          childCount: 0,
          text: 'Second',
          type: 12,
        },
      ],
      type: 6,
    },
  ])
})
