import { expect, test } from '@jest/globals'
import * as MergeClassNames from '../src/parts/MergeClassNames/MergeClassNames.ts'

test('mergeClassNames', () => {
  expect(MergeClassNames.mergeClassNames('a', 'b')).toBe('a b')
})
