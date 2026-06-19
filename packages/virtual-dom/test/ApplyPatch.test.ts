/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import type { Patch } from '../src/parts/Patch/Patch.ts'
import * as ApplyPatch from '../src/parts/ApplyPatch/ApplyPatch.ts'
import * as PatchType from '../src/parts/PatchType/PatchType.ts'
import { renderInto } from '../src/parts/VirtualDom/VirtualDom.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('attribute change', () => {
  const patches: readonly Patch[] = [
    {
      key: 'id',
      type: PatchType.SetAttribute,
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
      key: 'id',
      type: PatchType.RemoveAttribute,
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
      index: 1,
      type: PatchType.NavigateSibling,
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
      index: 2,
      type: PatchType.NavigateSibling,
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

test('text change of nested node', () => {
  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
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
      index: 0,
      type: PatchType.RemoveChild,
    },
  ]
  const $Node = document.createElement('div')
  const $Child = document.createElement('div')
  $Node.append($Child)
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children).toHaveLength(0)
})

test('element add', () => {
  const patches: readonly Patch[] = [
    {
      nodes: [
        {
          childCount: 0,
          className: 'test',
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
  ]
  const $Node = document.createElement('div')
  ApplyPatch.applyPatch($Node, patches)
  expect($Node.children).toHaveLength(1)
  expect($Node.firstElementChild?.className).toBe('test')
})

test('remove and add element', () => {
  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          className: 'test',
          type: VirtualDomElements.Div,
        },
      ],
      type: PatchType.Add,
    },
  ]
  const $Root = document.createElement('div')
  const $Child = document.createElement('div')
  $Root.append($Child)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(1)
  expect($Root.firstElementChild?.className).toBe('test')
})

test('expand search details', () => {
  const patches: readonly Patch[] = [
    {
      index: 1,
      type: PatchType.NavigateChild,
    },
    {
      nodes: [
        {
          className: 'Replace',
          type: VirtualDomElements.Input,
        },
      ],
      type: PatchType.Add,
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
  const $Replace = $TopRight.querySelector(':scope > .Replace')
  expect($Replace).toBeInstanceOf(HTMLInputElement)
  expect($Replace?.className).toBe('Replace')
})

test('collapse search details', () => {
  const patches: readonly Patch[] = [
    {
      index: 1,
      type: PatchType.NavigateChild,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
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
  expect($TopRight.firstElementChild).toBeInstanceOf(HTMLInputElement)
  expect($TopRight.firstElementChild?.className).toBe('SearchValue')
})

test('remove nested child node', () => {
  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  $Child1.className = '1'
  const $Child2 = document.createElement('div')
  $Child2.className = '2'
  const $Child3 = document.createElement('div')
  $Child3.className = '3'
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.firstElementChild).toBeInstanceOf(HTMLDivElement)
  expect($Root.firstElementChild?.children).toHaveLength(0)
  expect($Root.lastElementChild).toBeInstanceOf(HTMLDivElement)
})

test('remove and add node', () => {
  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createElement('div')
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.firstElementChild).toBeInstanceOf(HTMLDivElement)
  expect($Root.firstElementChild?.children).toHaveLength(1)
  expect($Root.firstElementChild?.firstElementChild).toBeInstanceOf(
    HTMLSpanElement,
  )
  expect($Root.lastElementChild).toBeInstanceOf(HTMLDivElement)
})

test('multiple changes', () => {
  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
    {
      type: PatchType.NavigateParent,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 0,
          type: VirtualDomElements.Span,
        },
      ],
      type: PatchType.Add,
    },
  ]
  const $Root = document.createElement('div')
  $Root.className = 'Root'
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('div')
  const $Child3 = document.createElement('div')
  $Child1.append($Child2)
  $Root.append($Child1, $Child3)
  ApplyPatch.applyPatch($Root, patches)
  expect($Root.children).toHaveLength(2)
  expect($Root.firstElementChild).toBeInstanceOf(HTMLDivElement)
  expect($Root.firstElementChild?.children).toHaveLength(1)
  expect($Root.firstElementChild?.firstElementChild).toBeInstanceOf(
    HTMLSpanElement,
  )
  expect($Root.lastElementChild).toBeInstanceOf(HTMLSpanElement)
})

test('navigate sibling after extra root navigation', () => {
  const oldDom = [
    {
      ariaLabel: 'Quick open',
      childCount: 2,
      className: 'Viewlet QuickPick',
      id: 'QuickPick',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'QuickPickHeader',
      type: VirtualDomElements.Div,
    },
    {
      ariaLabel: 'Type the name of a command to run.',
      childCount: 0,
      className: 'InputBox',
      inputType: 'text',
      type: VirtualDomElements.Input,
    },
    {
      childCount: 1,
      className: 'List ContainContent',
      id: 'QuickPickItems',
      role: 'listbox',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'ListItems ContainContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'QuickPickItem QuickPickItemActive',
      id: 'QuickPickItemActive',
      role: 'option',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'QuickPickItemLabel',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: 'Layout: Close Chat',
      type: VirtualDomElements.Text,
    },
    {
      childCount: 1,
      className: 'QuickPickItem',
      role: 'option',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'QuickPickItemLabel',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      text: 'Window: Close',
      type: VirtualDomElements.Text,
    },
  ]

  const patches: readonly Patch[] = [
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 1,
      type: PatchType.NavigateSibling,
    },
    {
      index: 0,
      type: PatchType.NavigateChild,
    },
    {
      index: 1,
      type: PatchType.RemoveChild,
    },
    {
      index: 0,
      type: PatchType.RemoveChild,
    },
    {
      nodes: [
        {
          childCount: 1,
          className: 'QuickPickItem QuickPickItemActive QuickPickStatus',
          type: VirtualDomElements.Div,
        },
        {
          childCount: 1,
          className: 'Label',
          type: VirtualDomElements.Div,
        },
        {
          childCount: 0,
          text: 'No Results',
          type: VirtualDomElements.Text,
        },
      ],
      type: PatchType.Add,
    },
  ]

  const $Container = document.createElement('div')
  renderInto($Container, oldDom)
  const $Root = $Container.firstChild as HTMLElement

  ApplyPatch.applyPatch($Root, patches)

  expect($Root.querySelector(':scope .QuickPickStatus')?.textContent).toBe(
    'No Results',
  )
  expect($Root.querySelectorAll(':scope .QuickPickItem')).toHaveLength(1)
  expect($Root.querySelector(':scope .ListItems')?.childNodes).toHaveLength(1)
})

test.todo('large patch')
