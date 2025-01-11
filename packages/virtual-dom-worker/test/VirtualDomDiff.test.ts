import { expect, test } from '@jest/globals'
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
      index: 1,
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
      index: 1,
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: 4,
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
          type: 4,
          childCount: 0,
        },
      ],
    },
    // TODO should navigate to parent and remove child at index 1
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ])
})

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
          type: 4,
          childCount: 0,
        },
      ],
    },
    {
      type: PatchType.Add,
      nodes: [
        {
          type: 4,
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
      index: 0,
    },
  ])
})
