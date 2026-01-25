import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import type { VirtualDomTreeNode } from '../src/parts/VirtualDomTree/VirtualDomTree.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import * as DiffTrees from '../src/parts/VirtualDomDiffTree/DiffTrees.ts'

test('diffTrees - empty trees', () => {
  const patches: Patch[] = []
  DiffTrees.diffTrees([], [], patches, [])
  expect(patches).toEqual([])
})

test('diffTrees - add new node', () => {
  const oldTree: readonly VirtualDomTreeNode[] = []
  const newTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 0,
      },
      children: [],
    },
  ]
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
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
  ])
})

test.skip('diffTrees - remove old node', () => {
  const oldTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 0,
      },
      children: [],
    },
  ]
  const newTree: readonly VirtualDomTreeNode[] = []
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
  expect(patches).toEqual([
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ])
})

test.skip('diffTrees - add node with children', () => {
  const oldTree: readonly VirtualDomTreeNode[] = []
  const newTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 1,
      },
      children: [
        {
          node: text('hello'),
          children: [],
        },
      ],
    },
  ]
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
  expect(patches).toEqual([
    {
      type: PatchType.Add,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 1,
        },
      ],
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
      type: PatchType.Add,
      nodes: [text('hello')],
    },
    {
      type: PatchType.NavigateParent,
    },
  ])
})

test.skip('diffTrees - compare nested trees', () => {
  const oldTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 1,
      },
      children: [
        {
          node: text('old'),
          children: [],
        },
      ],
    },
  ]
  const newTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 1,
      },
      children: [
        {
          node: text('new'),
          children: [],
        },
      ],
    },
  ]
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
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
    {
      type: PatchType.NavigateParent,
    },
  ])
})

test('diffTrees - multiple siblings', () => {
  const oldTree: readonly VirtualDomTreeNode[] = [
    {
      node: text('one'),
      children: [],
    },
    {
      node: text('two'),
      children: [],
    },
  ]
  const newTree: readonly VirtualDomTreeNode[] = [
    {
      node: text('uno'),
      children: [],
    },
    {
      node: text('dos'),
      children: [],
    },
  ]
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
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
      type: PatchType.NavigateParent,
    },
  ])
})

test('diffTrees - text node split differently', () => {
  // Old: text "Ab" + text "out"
  // New: text "Abo" + text "ut"
  const oldTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 2,
      },
      children: [
        {
          node: {
            type: VirtualDomElements.Span,
            childCount: 1,
          },
          children: [
            {
              node: text('Ab'),
              children: [],
            },
          ],
        },
        {
          node: text('out'),
          children: [],
        },
      ],
    },
  ]
  const newTree: readonly VirtualDomTreeNode[] = [
    {
      node: {
        type: VirtualDomElements.Div,
        childCount: 2,
      },
      children: [
        {
          node: {
            type: VirtualDomElements.Span,
            childCount: 1,
          },
          children: [
            {
              node: text('Abo'),
              children: [],
            },
          ],
        },
        {
          node: text('ut'),
          children: [],
        },
      ],
    },
  ]
  const patches: Patch[] = []
  DiffTrees.diffTrees(oldTree, newTree, patches, [])
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
      value: 'Abo',
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetText,
      value: 'ut',
    },
    {
      type: PatchType.NavigateParent,
    },
  ])
})
