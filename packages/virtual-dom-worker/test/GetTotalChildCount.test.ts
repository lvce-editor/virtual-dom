import { expect, test } from '@jest/globals'
import type { VirtualDomNode } from '../src/parts/VirtualDomNode/VirtualDomNode.ts'
import * as GetTotalChildCount from '../src/parts/GetTotalChildCount/GetTotalChildCount.ts'

test('single node', () => {
  const nodes: readonly VirtualDomNode[] = [
    {
      childCount: 0,
      type: 4,
    },
  ]
  const index = 0
  expect(GetTotalChildCount.getTotalChildCount(nodes, index)).toBe(1)
})

test('one child node', () => {
  const nodes: readonly VirtualDomNode[] = [
    {
      childCount: 1,
      type: 4,
    },
    {
      childCount: 0,
      type: 4,
    },
  ]
  const index = 0
  expect(GetTotalChildCount.getTotalChildCount(nodes, index)).toBe(2)
})

test('nested nodes', () => {
  const nodes: readonly VirtualDomNode[] = [
    {
      childCount: 1,
      type: 4,
    },
    {
      childCount: 1,
      type: 4,
    },
    {
      childCount: 0,
      type: 4,
    },
  ]
  const index = 0
  expect(GetTotalChildCount.getTotalChildCount(nodes, index)).toBe(3)
})
