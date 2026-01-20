import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import * as AddNavigationPatches from '../src/parts/VirtualDomDiffTree/AddNavigationPatches.ts'

test('addNavigationPatches - root path, index 0', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [], 0)
  expect(patches).toEqual([])
})

test('addNavigationPatches - root path, index 1', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [], 1)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ])
})

test('addNavigationPatches - single level path, index 0', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [0], 0)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
  ])
})

test('addNavigationPatches - single level path, index 1', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [0], 1)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
  ])
})

test('addNavigationPatches - multi-level path, index 0', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [0, 1, 2], 0)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.NavigateChild,
      index: 2,
    },
  ])
})

test('addNavigationPatches - multi-level path, index 3', () => {
  const patches: Patch[] = []
  AddNavigationPatches.addNavigationPatches(patches, [0, 1, 2], 3)
  expect(patches).toEqual([
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.NavigateChild,
      index: 2,
    },
    {
      type: PatchType.NavigateSibling,
      index: 3,
    },
  ])
})

test('addNavigationPatches - appends to existing patches', () => {
  const patches: Patch[] = [
    {
      type: PatchType.SetText,
      value: 'hello',
    },
  ]
  AddNavigationPatches.addNavigationPatches(patches, [0, 1], 2)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
      value: 'hello',
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.NavigateSibling,
      index: 2,
    },
  ])
})
