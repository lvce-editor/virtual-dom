import { expect, test } from '@jest/globals'
import type { VirtualDomNode } from '../src/parts/VirtualDomNode/VirtualDomNode.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import { diff } from '../src/parts/VirtualDomDiff/VirtualDomDiff.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - attribute removed', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      key: 'className',
    },
  ])
})

test('diff - nested nodes', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - multiple attributes changed', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - empty nodes', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - node type changed from div to span', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
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

test('diff - add new attribute', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - remove all attributes', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - change node type with attributes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'old-class',
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
      id: 'new-id',
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Span,
          id: 'new-id',
          childCount: 0,
        },
      ],
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
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
        },
      ],
    },
  ])
})

test('diff - two node type changes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
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
      childCount: 0,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
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
    {
      type: PatchType.RemoveChild,
      index: 1,
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

test('diff - two nested node type changes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
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
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
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

test('diff - three node type changes', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Span,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
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
    {
      type: PatchType.RemoveChild,
      index: 1,
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
    {
      type: PatchType.RemoveChild,
      index: 2,
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

test('diff - same attribute values should not generate patches', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - mixed attribute changes', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - button to input conversion', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
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

test('diff - same text content should not generate patches', () => {
  const oldNodes = [text('hello')]
  const newNodes = [text('hello')]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([])
})

test('diff - multiple text nodes in sequence', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - table structure', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - deep nested structure', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - node with multiple children', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - add data attributes', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - change element with ARIA attributes', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - form elements', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - child removed, sibling added', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
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
      type: PatchType.NavigateSibling,
      index: 2,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
        },
      ],
    },
  ])
})

test('diff - child added, sibling removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const newNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - attribute removed 1', () => {
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveAttribute,
      key: 'className',
    },
  ])
})
test('diff - nested nodes 1', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - multiple attributes changed 1', () => {
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
  const patches = diff(oldNodes, newNodes)
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

test('diff - first child and nested child removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 1, // TODO due to the first child removed, this should be zero
    },
  ])
})

test('diff - two children added', () => {
  const oldNodes = [
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
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ]
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
        },
      ],
    },
  ])
})

test('diff - two children removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ])
})

test('diff - three children removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 3,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ])
})

test('diff - four children removed', () => {
  const oldNodes = [
    {
      type: VirtualDomElements.Div,
      childCount: 4,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
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
  const patches = diff(oldNodes, newNodes)
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ])
})

test('nested elements removed', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'a',
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'b',
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
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'b',
    },
  ])
})

test('nested elements removed 2', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
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
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'a',
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'b',
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
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'b',
    },
  ])
})

test('large diff', () => {
  const oldNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      className: 'Viewlet Search',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeader',
      role: 'none',
      childCount: 2,
      onClick: 'handleHeaderClick2',
      onFocusIn: 'handleHeaderFocusIn',
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderTop',
      role: 'none',
      childCount: 2,
    },
    {
      type: 1,
      className: 'IconButton SearchToggleButton SearchToggleButtonExpanded',
      title: 'Toggle Replace',
      ariaLabel: 'Toggle Replace',
      ariaExpanded: true,
      childCount: 1,
      'data-command': 'toggleReplace',
      name: 'ToggleReplace',
    },
    {
      type: VirtualDomElements.Div,
      className: 'MaskIcon MaskIconChevronDown',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderTopRight',
      role: 'none',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchField',
      role: 'none',
      childCount: 2,
    },
    {
      type: VirtualDomElements.TextArea,
      className: 'MultilineInputBox',
      spellcheck: false,
      autocapitalize: 'off',
      autocorrect: 'off',
      placeholder: 'Search',
      name: 'SearchValue',
      onInput: 'handleInput',
      onFocus: '',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchFieldButtons',
      childCount: 3,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'MatchCase',
      title: 'Match Case',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconCaseSensitive',
      childCount: 0,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'MatchWholeWord',
      title: 'Match Whole Word',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconWholeWord',
      childCount: 0,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'UseRegularExpression',
      title: 'Use Regular Expression',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconRegex',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchFieldContainer',
      role: 'none',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchField',
      role: 'none',
      childCount: 2,
    },
    {
      type: VirtualDomElements.TextArea,
      className: 'MultilineInputBox',
      spellcheck: false,
      autocapitalize: 'off',
      autocorrect: 'off',
      placeholder: 'Replace',
      name: 'ReplaceValue',
      onInput: 'handleReplaceInput',
      onFocus: '',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchFieldButtons',
      childCount: 1,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'PreserveCase',
      title: 'Preserve Case',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconPreserveCase',
      childCount: 0,
    },
    {
      type: 1,
      className: 'SearchFieldButton SearchFieldButtonDisabled',
      name: 'ReplaceAll',
      title: 'Replace All',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconReplaceAll',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderDetails',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'ViewletSearchMessage',
      role: 'status',
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: '',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'ToggleDetails',
      role: 'button',
      tabIndex: 0,
      ariaLabel: 'Toggle Search Details',
      title: 'Toggle Search Details',
      name: 'ToggleSearchDetails',
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'MaskIcon MaskIconEllipsis',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'Viewlet List Tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'TreeItems',
      childCount: 0,
      onClick: 'handleClick',
      onBlur: 'handleListBlur',
      onWheel: 'handleWheel',
      id: 'TreeItems',
      top: '0px',
    },
  ]
  const newNodes: readonly VirtualDomNode[] = [
    {
      type: VirtualDomElements.Div,
      className: 'Viewlet Search',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeader',
      role: 'none',
      childCount: 2,
      onClick: 'handleHeaderClick2',
      onFocusIn: 'handleHeaderFocusIn',
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderTop',
      role: 'none',
      childCount: 2,
    },
    {
      type: 1,
      className: 'IconButton SearchToggleButton',
      title: 'Toggle Replace',
      ariaLabel: 'Toggle Replace',
      ariaExpanded: false,
      childCount: 1,
      'data-command': 'toggleReplace',
      name: 'ToggleReplace',
    },
    {
      type: VirtualDomElements.Div,
      className: 'MaskIcon MaskIconChevronRight',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderTopRight',
      role: 'none',
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchField',
      role: 'none',
      childCount: 2,
    },
    {
      type: VirtualDomElements.TextArea,
      className: 'MultilineInputBox',
      spellcheck: false,
      autocapitalize: 'off',
      autocorrect: 'off',
      placeholder: 'Search',
      name: 'SearchValue',
      onInput: 'handleInput',
      onFocus: '',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchFieldButtons',
      childCount: 3,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'MatchCase',
      title: 'Match Case',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconCaseSensitive',
      childCount: 0,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'MatchWholeWord',
      title: 'Match Whole Word',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconWholeWord',
      childCount: 0,
    },
    {
      type: 1,
      className: 'SearchFieldButton',
      name: 'UseRegularExpression',
      title: 'Use Regular Expression',
      role: 'checkbox',
      ariaChecked: false,
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      className: 'MaskIcon MaskIconRegex',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'SearchHeaderDetails',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      className: 'ViewletSearchMessage',
      role: 'status',
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Text,
      text: '',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'ToggleDetails',
      role: 'button',
      tabIndex: 0,
      ariaLabel: 'Toggle Search Details',
      title: 'Toggle Search Details',
      name: 'ToggleSearchDetails',
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'MaskIcon MaskIconEllipsis',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'Viewlet List Tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'TreeItems',
      childCount: 0,
      onClick: 'handleClick',
      onBlur: 'handleListBlur',
      onWheel: 'handleWheel',
      id: 'TreeItems',
      top: '0px',
    },
  ]
  const patches = diff(oldNodes, newNodes)
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
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'IconButton SearchToggleButton',
    },
    {
      type: PatchType.SetAttribute,
      key: 'ariaExpanded',
      value: false,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'MaskIcon MaskIconChevronRight',
    },

    // TODO this navigation seems wrong
    {
      type: PatchType.NavigateParent,
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
      type: PatchType.NavigateParent,
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
      type: PatchType.NavigateParent,
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
      type: PatchType.NavigateSibling,
      index: 4,
    },
    // TODO this should not be in the diff, search header details hasn't changed
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'SearchHeaderDetails',
    },
    {
      type: PatchType.RemoveAttribute,
      key: 'role',
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateSibling,
      index: 4,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'ViewletSearchMessage',
    },
    {
      type: PatchType.SetAttribute,
      key: 'role',
      value: 'status',
    },
    {
      type: PatchType.SetAttribute,
      key: 'tabIndex',
      value: 0,
    },
    {
      type: PatchType.RemoveChild,
      index: 4,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Text,
          text: '',
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.NavigateSibling,
      index: 5,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'ToggleDetails',
    },
    {
      type: PatchType.SetAttribute,
      key: 'role',
      value: 'button',
    },
    {
      type: PatchType.SetAttribute,
      key: 'tabIndex',
      value: 0,
    },
    {
      type: PatchType.SetAttribute,
      key: 'ariaLabel',
      value: 'Toggle Search Details',
    },
    {
      type: PatchType.SetAttribute,
      key: 'title',
      value: 'Toggle Search Details',
    },
    {
      type: PatchType.SetAttribute,
      key: 'name',
      value: 'ToggleSearchDetails',
    },
    {
      type: PatchType.RemoveChild,
      index: 5,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          className: 'MaskIcon MaskIconEllipsis',
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.RemoveChild,
      index: 6,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          className: 'Viewlet List Tree',
          role: 'tree',
          tabIndex: 0,
          childCount: 1,
        },
        {
          type: VirtualDomElements.Div,
          className: 'TreeItems',
          childCount: 0,
          onClick: 'handleClick',
          onBlur: 'handleListBlur',
          onWheel: 'handleWheel',
          id: 'TreeItems',
          top: '0px',
        },
      ],
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 7,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.RemoveChild,
      index: 7,
    },
  ])
})
