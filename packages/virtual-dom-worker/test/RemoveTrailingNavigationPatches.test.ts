import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import * as RemoveTrailingNavigationPatches from '../src/parts/VirtualDomDiffTree/RemoveTrailingNavigationPatches.ts'

test('removeTrailingNavigationPatches - empty array', () => {
  const patches: Patch[] = []
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([])
})

test('removeTrailingNavigationPatches - no navigation patches', () => {
  const patches: Patch[] = [
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'test',
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual(patches)
})

test('removeTrailingNavigationPatches - only navigation patches', () => {
  const patches: Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([])
})

test('removeTrailingNavigationPatches - trailing navigation patches', () => {
  const patches: Patch[] = [
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([
    {
      type: PatchType.SetText,
      value: 'hello',
    },
  ])
})

test('removeTrailingNavigationPatches - navigation patches in middle', () => {
  const patches: Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'test',
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.SetAttribute,
      key: 'className',
      value: 'test',
    },
  ])
})

test('removeTrailingNavigationPatches - mixed patches with trailing navigation', () => {
  const patches: Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.SetAttribute,
      key: 'id',
      value: 'test',
    },
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateSibling,
      index: 2,
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.SetAttribute,
      key: 'id',
      value: 'test',
    },
  ])
})

test('removeTrailingNavigationPatches - all navigation types', () => {
  const patches: Patch[] = [
    {
      type: PatchType.Add,
      nodes: [],
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ]
  const result =
    RemoveTrailingNavigationPatches.removeTrailingNavigationPatches(patches)
  expect(result).toEqual([
    {
      type: PatchType.Add,
      nodes: [],
    },
  ])
})
