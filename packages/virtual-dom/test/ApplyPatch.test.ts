/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as ApplyPatch from '../src/parts/ApplyPatch/ApplyPatch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('attribute change', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetAttribute,
      index: 0,
      key: 'id',
      value: 'test',
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.id).toBe('test')
})

test('attribute remove', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.RemoveAttribute,
      index: 0,
      key: 'id',
    },
  ]
  const $Node = document.createElement('div')
  $Node.id = 'test'
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.id).toBe('')
})

test('text change', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Node = document.createTextNode('test')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.textContent).toBe('test')
})

test('text change of second node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateSibling,
      index: 1,
    },
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createTextNode('')
  $Root.append($Child1, $Child2)
  ApplyPatch.applyPatch($Child1, patches)
  expect($Child2.textContent).toBe('test')
})

test('text change of third node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateSibling,
      index: 2,
    },
    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createTextNode('')
  $Root.append($Child1, $Child2, $Child3)
  ApplyPatch.applyPatch($Child1, patches)
  expect($Child3.textContent).toBe('test')
})

test.skip('text change of nested node', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 0,
    },
    {
      type: PatchType.NavigateChild,
      index: 0,
    },

    {
      type: PatchType.SetText,
      value: 'test',
    },
  ]
  const $Root = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createTextNode('')
  $Child1.append($Child2)
  $Root.append($Child1)
  ApplyPatch.applyPatch($Root, patches)
  expect($Child2.textContent).toBe('test')
})

test('element removeChild', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.RemoveChild,
      index: 0,
    },
  ]
  const $Node = document.createElement('div')
  const $Child = document.createElement('div')
  $Node.append($Child)
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children.length).toBe(0)
})

test('element add', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.Add,
      index: 1,
      nodes: [
        {
          type: VirtualDomElements.Div,
          childCount: 0,
          className: 'test',
        },
      ],
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children.length).toBe(1)
  expect($Node.firstElementChild?.className).toBe('test')
})

test('expand search details', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.Add,
      index: 0,
      nodes: [
        {
          type: VirtualDomElements.Input,
          className: 'Replace',
        },
      ],
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'SearchHeaderTop'
  const $Toggle = document.createElement('div')
  $Toggle.className = 'Toggle'
  const $TopRight = document.createElement('div')
  $TopRight.className = 'SearchHeaderTopRight'
  const $Input = document.createElement('input')
  $Input.className = 'SearchValue'
  $TopRight.append($Input)
  $Root.append($Toggle, $TopRight)
  ApplyPatch.applyPatch($Root, patches)
  expect($TopRight.children).toHaveLength(2)
  expect($TopRight.children[1]).toBeInstanceOf(HTMLInputElement)
  expect($TopRight.children[1].className).toBe('Replace')
})

test('collapse search details', () => {
  const patches: readonly Patch[] = [
    {
      type: PatchType.NavigateChild,
      index: 1,
    },
    {
      type: PatchType.RemoveChild,
      index: 1,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'SearchHeaderTop'
  const $Toggle = document.createElement('div')
  $Toggle.className = 'Toggle'
  const $TopRight = document.createElement('div')
  $TopRight.className = 'SearchHeaderTopRight'
  const $Input = document.createElement('input')
  $Input.className = 'SearchValue'
  const $Replace = document.createElement('input')
  $Replace.className = 'Replace'
  $TopRight.append($Input, $Replace)
  $Root.append($Toggle, $TopRight)
  ApplyPatch.applyPatch($Root, patches)
  expect($TopRight.children).toHaveLength(1)
  expect($TopRight.children[0]).toBeInstanceOf(HTMLInputElement)
  expect($TopRight.children[0].className).toBe('SearchValue')
})
