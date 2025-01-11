import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'

test('patch type safety', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  expect(patches).toBeDefined()
})
