import { test, expect } from '@jest/globals'
import { text } from '../src/index.ts'

test('text', () => {
  expect(text('')).toBeDefined()
})
