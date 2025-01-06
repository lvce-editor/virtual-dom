import { expect, test } from '@jest/globals'
import { diff } from '../src/parts/VirtualDomDiff/VirtualDomDiff.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'
import { text } from '../src/parts/Text/Text.ts'

test('diff - text node changed', () => {
  const oldNode = text('hello')
  const newNode = text('world')
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: 'setText',
      index: 0,
      value: 'world',
    },
  ])
})

test('diff - attribute changed', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    className: 'old-class',
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Div,
    className: 'new-class',
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: 'setAttribute',
      index: 0,
      key: 'className',
      value: 'new-class',
    },
  ])
})

test('diff - node type changed', () => {
  const oldNode = {
    type: VirtualDomElements.Div,
    childCount: 0,
  }
  const newNode = {
    type: VirtualDomElements.Span,
    childCount: 0,
  }
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: 'replace',
      index: 0,
      node: newNode,
    },
  ])
})
