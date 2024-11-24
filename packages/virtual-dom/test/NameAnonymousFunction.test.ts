import { expect, test } from '@jest/globals'
import * as NameAnonymousFunction from '../src/parts/NameAnonymousFunction/NameAnonymousFunction.ts'

test('nameAnonymousFunction - sets function name', () => {
  const anonymousFunction = () => {
    return 'test'
  }
  expect(anonymousFunction.name).toBe('anonymousFunction')
  NameAnonymousFunction.nameAnonymousFunction(anonymousFunction, 'testFunction')
  expect(anonymousFunction.name).toBe('testFunction')
})

test('nameAnonymousFunction - can override existing function name', () => {
  function namedFunction() {
    return 'test'
  }
  expect(namedFunction.name).toBe('namedFunction')
  NameAnonymousFunction.nameAnonymousFunction(namedFunction, 'newName')
  expect(namedFunction.name).toBe('newName')
})

test('nameAnonymousFunction - works with arrow functions', () => {
  const arrowFunction = () => 'test'
  expect(arrowFunction.name).toBe('arrowFunction')
  NameAnonymousFunction.nameAnonymousFunction(arrowFunction, 'arrowTest')
  expect(arrowFunction.name).toBe('arrowTest')
})
