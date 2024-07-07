import { expect, test } from '@jest/globals'
import * as Main from '../src/parts/Main/Main.ts'

test('render', () => {
  expect(typeof Main.render).toBeDefined()
})
