import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import type { VirtualDomNode } from '../src/parts/VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import { diff } from '../src/parts/VirtualDomDiff/VirtualDomDiff.ts'

test('diff - text node changed', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('world')]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diff - attribute changed 1', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'new-class',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'new-class',
    },
  ])
})

test('diff - attribute removed', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.RemoveAttribute,
    },
  ])
})

test('diff - nested nodes', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('hello'),
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('world'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diff - multiple attributes changed', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      id: 'old-id',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'new-class',
      id: 'new-id',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'new-class',
    },
    {
      key: 'id',
      type: PatchType.SetAttribute,
      value: 'new-id',
    },
  ])
})

test('diff - empty nodes', () => {
  const oldNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - node type changed from div to span', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - add new attribute', () => {
  const oldNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'new-class',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'new-class',
    },
  ])
})

test('diff - remove all attributes', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      id: 'old-id',
      title: 'old-title',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.RemoveAttribute,
    },
    {
      key: 'id',
      type: PatchType.RemoveAttribute,
    },
    {
      key: 'title',
      type: PatchType.RemoveAttribute,
    },
  ])
})

test('diff - change node type with attributes', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'old-class',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      id: 'new-id',
      type: VirtualDomElements.Span,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          id: 'new-id',
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - empty text to non-empty text', () => {
  const oldNodes = [text('')]
  const newNodes = [text('hello')]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'hello',
    },
  ])
})

test('diff - text node to div node', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('hello'),
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - two node type changes', () => {
  const oldNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - two nested node type changes', () => {
  const oldNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - three node type changes', () => {
  const oldNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Span,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
    {
      index: 2,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - same attribute values should not generate patches', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'same-class',
      id: 'same-id',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'same-class',
      id: 'same-id',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - mixed attribute changes', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'keep-class',
      id: 'old-id',
      title: 'to-remove',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'keep-class',
      'data-new': 'added',
      id: 'new-id',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'id',
      type: PatchType.SetAttribute,
      value: 'new-id',
    },
    {
      key: 'data-new',
      type: PatchType.SetAttribute,
      value: 'added',
    },
    {
      key: 'title',
      type: PatchType.RemoveAttribute,
    },
  ])
})

test('diff - button to input conversion', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'btn',
      type: VirtualDomElements.Button,
    },
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'input',
      type: VirtualDomElements.Input,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          className: 'input',
          type: VirtualDomElements.Input,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - same text content should not generate patches', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('hello')]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - multiple text nodes in sequence', () => {
  const oldNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    text('hello'),
    text('world'),
  ]
  const newNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    text('hi'),
    text('earth'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'hi',
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      type: PatchType.SetText,
      value: 'earth',
    },
  ])
})

test('diff - table structure', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Table,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Tr,
    },
    text('old'),
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Table,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Tr,
    },
    text('new'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'new',
    },
  ])
})

test('diff - deep nested structure', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('deep'),
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('deeper'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'deeper',
    },
  ])
})

test('diff - node with multiple children', () => {
  const oldNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    text('one'),
    text('two'),
    text('three'),
  ]
  const newNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    text('uno'),
    text('dos'),
    text('tres'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'uno',
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      type: PatchType.SetText,
      value: 'dos',
    },
    {
      index: 2,
      type: PatchType.NavigateSibling,
    },
    {
      type: PatchType.SetText,
      value: 'tres',
    },
  ])
})

test('diff - add data attributes', () => {
  const oldNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      'data-testid': 'test',
      'data-value': '123',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'data-testid',
      type: PatchType.SetAttribute,
      value: 'test',
    },
    {
      key: 'data-value',
      type: PatchType.SetAttribute,
      value: '123',
    },
  ])
})

test('diff - change element with ARIA attributes', () => {
  const oldNodes = [
    {
      'aria-expanded': false,
      'aria-label': 'Old Label',
      childCount: 0,
      type: VirtualDomElements.Button,
    },
  ]
  const newNodes = [
    {
      'aria-expanded': true,
      'aria-label': 'New Label',
      childCount: 0,
      type: VirtualDomElements.Button,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'aria-label',
      type: PatchType.SetAttribute,
      value: 'New Label',
    },
    {
      key: 'aria-expanded',
      type: PatchType.SetAttribute,
      value: true,
    },
  ])
})

test('diff - form elements', () => {
  const oldNodes = [
    {
      childCount: 0,
      inputType: 'text',
      type: VirtualDomElements.Input,
      value: 'old',
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      inputType: 'password',
      type: VirtualDomElements.Input,
      value: 'new',
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'value',
      type: PatchType.SetAttribute,
      value: 'new',
    },
    {
      key: 'inputType',
      type: PatchType.SetAttribute,
      value: 'password',
    },
  ])
})

test('diff - child removed, sibling added', () => {
  const oldNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 2,
      type: PatchType.NavigateSibling,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - child added, sibling removed', () => {
  const oldNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
  ])
})

test('diff - text node changed 1', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('world')]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diff - attribute changed', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'new-class',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'new-class',
    },
  ])
})

test('diff - attribute removed 1', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.RemoveAttribute,
    },
  ])
})
test('diff - nested nodes 1', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('hello'),
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    text('world'),
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.SetText,
      value: 'world',
    },
  ])
})

test('diff - multiple attributes changed 1', () => {
  const oldNodes = [
    {
      childCount: 0,
      className: 'old-class',
      id: 'old-id',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      className: 'new-class',
      id: 'new-id',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'new-class',
    },
    {
      key: 'id',
      type: PatchType.SetAttribute,
      value: 'new-id',
    },
  ])
})

test('diff - first child and nested child removed', () => {
  const oldNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 1, // TODO due to the first child removed, this should be zero
      type: PatchType.RemoveChild,
    },
  ])
})

test('diff - two children added', () => {
  const oldNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
  ])
})

test('diff - two children removed', () => {
  const oldNodes = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
  ])
})

test('diff - three children removed', () => {
  const oldNodes = [
    {
      childCount: 3,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
  ])
})

test('diff - four children removed', () => {
  const oldNodes = [
    {
      childCount: 4,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes = [
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
  ])
})

test('nested elements removed', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      className: 'a',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      className: 'b',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'b',
    },
  ])
})

test('nested elements removed 2', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      className: 'a',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Div,
    },
    {
      className: 'b',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'b',
    },
  ])
})

test('large diff', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      className: 'Viewlet Search',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchHeader',
      onClick: 'handleHeaderClick2',
      onFocusIn: 'handleHeaderFocusIn',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchHeaderTop',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      ariaExpanded: true,
      ariaLabel: 'Toggle Replace',
      childCount: 1,
      className: 'IconButton SearchToggleButton SearchToggleButtonExpanded',
      'data-command': 'toggleReplace',
      name: 'ToggleReplace',
      title: 'Toggle Replace',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconChevronDown',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchHeaderTopRight',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchField',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      autocapitalize: 'off',
      autocorrect: 'off',
      childCount: 0,
      className: 'MultilineInputBox',
      name: 'SearchValue',
      onFocus: '',
      onInput: 'handleInput',
      placeholder: 'Search',
      spellcheck: false,
      type: VirtualDomElements.TextArea,
    },
    {
      childCount: 3,
      className: 'SearchFieldButtons',
      type: VirtualDomElements.Div,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'MatchCase',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Match Case',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconCaseSensitive',
      type: VirtualDomElements.Span,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'MatchWholeWord',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Match Whole Word',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconWholeWord',
      type: VirtualDomElements.Span,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'UseRegularExpression',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Use Regular Expression',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconRegex',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 2,
      className: 'SearchFieldContainer',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchField',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      autocapitalize: 'off',
      autocorrect: 'off',
      childCount: 0,
      className: 'MultilineInputBox',
      name: 'ReplaceValue',
      onFocus: '',
      onInput: 'handleReplaceInput',
      placeholder: 'Replace',
      spellcheck: false,
      type: VirtualDomElements.TextArea,
    },
    {
      childCount: 1,
      className: 'SearchFieldButtons',
      type: VirtualDomElements.Div,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'PreserveCase',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Preserve Case',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconPreserveCase',
      type: VirtualDomElements.Span,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton SearchFieldButtonDisabled',
      name: 'ReplaceAll',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Replace All',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconReplaceAll',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 2,
      className: 'SearchHeaderDetails',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'ViewletSearchMessage',
      role: 'status',
      tabIndex: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: '',
      type: VirtualDomElements.Text,
    },
    {
      ariaLabel: 'Toggle Search Details',
      childCount: 1,
      className: 'ToggleDetails',
      name: 'ToggleSearchDetails',
      role: 'button',
      tabIndex: 0,
      title: 'Toggle Search Details',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconEllipsis',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'Viewlet List Tree',
      role: 'tree',
      tabIndex: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'TreeItems',
      id: 'TreeItems',
      onBlur: 'handleListBlur',
      onClick: 'handleClick',
      onWheel: 'handleWheel',
      top: '0px',
      type: VirtualDomElements.Div,
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      childCount: 2,
      className: 'Viewlet Search',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchHeader',
      onClick: 'handleHeaderClick2',
      onFocusIn: 'handleHeaderFocusIn',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchHeaderTop',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      ariaExpanded: false,
      ariaLabel: 'Toggle Replace',
      childCount: 1,
      className: 'IconButton SearchToggleButton',
      'data-command': 'toggleReplace',
      name: 'ToggleReplace',
      title: 'Toggle Replace',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconChevronRight',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'SearchHeaderTopRight',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'SearchField',
      role: 'none',
      type: VirtualDomElements.Div,
    },
    {
      autocapitalize: 'off',
      autocorrect: 'off',
      childCount: 0,
      className: 'MultilineInputBox',
      name: 'SearchValue',
      onFocus: '',
      onInput: 'handleInput',
      placeholder: 'Search',
      spellcheck: false,
      type: VirtualDomElements.TextArea,
    },
    {
      childCount: 3,
      className: 'SearchFieldButtons',
      type: VirtualDomElements.Div,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'MatchCase',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Match Case',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconCaseSensitive',
      type: VirtualDomElements.Span,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'MatchWholeWord',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Match Whole Word',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconWholeWord',
      type: VirtualDomElements.Span,
    },
    {
      ariaChecked: false,
      childCount: 1,
      className: 'SearchFieldButton',
      name: 'UseRegularExpression',
      role: 'checkbox',
      tabIndex: 0,
      title: 'Use Regular Expression',
      type: 1,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconRegex',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 2,
      className: 'SearchHeaderDetails',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'ViewletSearchMessage',
      role: 'status',
      tabIndex: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: '',
      type: VirtualDomElements.Text,
    },
    {
      ariaLabel: 'Toggle Search Details',
      childCount: 1,
      className: 'ToggleDetails',
      name: 'ToggleSearchDetails',
      role: 'button',
      tabIndex: 0,
      title: 'Toggle Search Details',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconEllipsis',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'Viewlet List Tree',
      role: 'tree',
      tabIndex: 0,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'TreeItems',
      id: 'TreeItems',
      onBlur: 'handleListBlur',
      onClick: 'handleClick',
      onWheel: 'handleWheel',
      top: '0px',
      type: VirtualDomElements.Div,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'IconButton SearchToggleButton',
    },
    {
      key: 'ariaExpanded',
      type: PatchType.SetAttribute,
      value: false,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'MaskIcon MaskIconChevronRight',
    },

    // TODO this navigation seems wrong
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 4,
      type: PatchType.NavigateSibling,
    },
    // TODO this should not be in the diff, search header details hasn't changed
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'SearchHeaderDetails',
    },
    {
      key: 'role',
      type: PatchType.RemoveAttribute,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 4,
      type: PatchType.NavigateSibling,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'ViewletSearchMessage',
    },
    {
      key: 'role',
      type: PatchType.SetAttribute,
      value: 'status',
    },
    {
      key: 'tabIndex',
      type: PatchType.SetAttribute,
      value: 0,
    },
    {
      index: 4,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          text: '',
          type: VirtualDomElements.Text,
        },
      ],
      type: PatchType.Add,
    },
    {
      index: 5,
      type: PatchType.NavigateSibling,
    },
    {
      key: 'className',
      type: PatchType.SetAttribute,
      value: 'ToggleDetails',
    },
    {
      key: 'role',
      type: PatchType.SetAttribute,
      value: 'button',
    },
    {
      key: 'tabIndex',
      type: PatchType.SetAttribute,
      value: 0,
    },
    {
      key: 'ariaLabel',
      type: PatchType.SetAttribute,
      value: 'Toggle Search Details',
    },
    {
      key: 'title',
      type: PatchType.SetAttribute,
      value: 'Toggle Search Details',
    },
    {
      key: 'name',
      type: PatchType.SetAttribute,
      value: 'ToggleSearchDetails',
    },
    {
      index: 5,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          className: 'MaskIcon MaskIconEllipsis',
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
    {
      index: 6,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 1,
          className: 'Viewlet List Tree',
          role: 'tree',
          tabIndex: 0,
          type: VirtualDomElements.Div,
        },
        {
          childCount: 0,
          className: 'TreeItems',
          id: 'TreeItems',
          onBlur: 'handleListBlur',
          onClick: 'handleClick',
          onWheel: 'handleWheel',
          top: '0px',
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 7,
      type: PatchType.RemoveChild,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 7,
      type: PatchType.RemoveChild,
    },
  ])
})
