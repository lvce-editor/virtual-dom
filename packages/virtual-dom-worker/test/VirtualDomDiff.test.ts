import { expect, test } from '@jest/globals'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { text } from '../src/parts/Text/Text.ts'
import { diff } from '../src/parts/VirtualDomDiff/VirtualDomDiff.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('diff - text node changed', () => {
  const oldNode = text('hello')
  const newNode = text('world')
  const patches = diff(oldNode, newNode)
  expect(patches).toEqual([
    {
      type: PatchType.SetText,
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
      type: PatchType.SetAttribute,
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
      type: PatchType.Replace,
      index: 0,
      node: newNode,
    },
  ])
})
