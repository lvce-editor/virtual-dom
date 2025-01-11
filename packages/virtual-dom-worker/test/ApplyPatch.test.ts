/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as ApplyPatch from '../src/parts/ApplyPatch/ApplyPatch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'

test('attribute change', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'id',
      value: 'test',
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.id).toBe('test')
})
