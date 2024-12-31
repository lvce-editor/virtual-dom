import { text } from '../src/index.ts'
import { test, expect } from '@jest/globals'

test('text', () => {
  expect(text('')).toBeDefined()
})
