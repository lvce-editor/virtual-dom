import { expect, test } from '@jest/globals'
import * as NameAnonymousFunction from '../src/parts/NameAnonymousFunction/NameAnonymousFunction.ts'

const anonymousFunction = (): string => {
  return 'test'
}

test('nameAnonymousFunction - sets function name', () => {
  expect(anonymousFunction.name).toBe('anonymousFunction')
  NameAnonymousFunction.nameAnonymousFunction(anonymousFunction, 'testFunction')
  expect(anonymousFunction.name).toBe('testFunction')
})

function namedFunction(): string {
  return 'test'
}

test('nameAnonymousFunction - can override existing function name', () => {
  expect(namedFunction.name).toBe('namedFunction')
  NameAnonymousFunction.nameAnonymousFunction(namedFunction, 'newName')
  expect(namedFunction.name).toBe('newName')
})

const arrowFunction = (): string => 'test'

test('nameAnonymousFunction - works with arrow functions', () => {
  expect(arrowFunction.name).toBe('arrowFunction')
  NameAnonymousFunction.nameAnonymousFunction(arrowFunction, 'arrowTest')
  expect(arrowFunction.name).toBe('arrowTest')
})
