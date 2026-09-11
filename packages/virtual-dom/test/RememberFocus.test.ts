/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import * as EventState from '../src/parts/EventState/EventState.ts'
import * as Instances from '../src/parts/Instances/Instances.ts'
import { rememberFocus } from '../src/parts/RememberFocus/RememberFocus.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('rememberFocus - preserves focus on tree element', () => {
  // Create initial DOM structure
  const $Viewlet = document.createElement('div')
  $Viewlet.tabIndex = 0
  $Viewlet.setAttribute('role', 'tree')
  document.body.append($Viewlet)

  // Focus the tree element
  $Viewlet.focus()
  expect(document.activeElement).toBe($Viewlet)

  // Create new virtual DOM
  const dom = [
    {
      childCount: 0,
      className: 'tree',
      role: 'tree',
      tabIndex: 0,
      type: 4, // Div
    },
  ]

  // Update the DOM while preserving focus
  const $NewViewlet = rememberFocus($Viewlet, dom, {})

  // Verify focus was preserved
  expect(document.activeElement).toBe($NewViewlet)
})

test('rememberFocus - restores event handling when rendering throws', () => {
  const $Viewlet = document.createElement('div')

  try {
    expect(() => rememberFocus($Viewlet, [], {}, 1)).toThrow()
    expect(EventState.enabled()).toBe(false)
  } finally {
    EventState.stopIgnore()
  }
})

test('rememberFocus - updates attributes on the preserved focused element', () => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: {
      escape: (value: string) => value,
    },
  })
  const $Viewlet = document.createElement('div')
  const $Toggle = document.createElement('button')
  $Toggle.className = 'SearchFieldButton'
  $Toggle.name = 'ToggleReplace'
  $Toggle.setAttribute('aria-expanded', 'false')
  $Toggle.dataset.stale = 'true'
  $Viewlet.append($Toggle)
  document.body.append($Viewlet)
  $Toggle.focus()

  const dom = [
    {
      childCount: 1,
      className: 'FindWidget',
      type: VirtualDomElements.Div,
    },
    {
      'aria-expanded': true,
      childCount: 0,
      className: 'SearchFieldButton SearchFieldButtonChecked',
      name: 'ToggleReplace',
      title: 'Toggle Replace',
      type: VirtualDomElements.Button,
    },
  ]

  const $NewViewlet = rememberFocus($Viewlet, dom, {}, 1)
  const $NewToggle = (
    $NewViewlet as HTMLElement
  ).querySelector<HTMLButtonElement>('[name="ToggleReplace"]')

  expect($NewToggle).toBe($Toggle)
  expect(document.activeElement).toBe($Toggle)
  expect($NewToggle?.className).toBe(
    'SearchFieldButton SearchFieldButtonChecked',
  )
  expect($NewToggle?.getAttribute('aria-expanded')).toBe('true')
  expect($NewToggle?.dataset.stale).toBeUndefined()
  expect($NewToggle?.title).toBe('Toggle Replace')
})

test('rememberFocus - preserves a focused element inside a referenced subtree', () => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: {
      escape: (value: string) => value,
    },
  })
  const $Workbench = document.createElement('div')
  const $Actions = document.createElement('div')
  const $OpenSearchEditor = document.createElement('button')
  $OpenSearchEditor.name = 'OpenSearchEditor'
  $Actions.append($OpenSearchEditor)
  $Workbench.append($Actions)
  document.body.append($Workbench)
  $OpenSearchEditor.focus()
  Instances.set(42, {
    state: {
      $Viewlet: $Actions,
    },
  })

  const dom = [
    {
      childCount: 1,
      className: 'Workbench',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Reference,
      uid: 42,
    },
  ]

  const $NewWorkbench = rememberFocus($Workbench, dom, {}, 1)

  expect($NewWorkbench.contains($OpenSearchEditor)).toBe(true)
  expect(document.activeElement).toBe($OpenSearchEditor)
})

test('rememberFocus - uses the new value when a readonly input becomes editable', () => {
  const $Viewlet = document.createElement('div')
  const $Input = document.createElement('input')
  $Input.name = 'secret-value'
  $Input.readOnly = true
  $Input.value = 'masked'
  $Viewlet.append($Input)

  const dom = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      inputType: 'password',
      name: 'secret-value',
      readOnly: false,
      type: VirtualDomElements.Input,
      value: 'plain-text-secret',
    },
  ]

  const $NewViewlet = rememberFocus($Viewlet, dom, {}, 1)
  const $NewInput = (
    $NewViewlet as HTMLElement
  ).querySelector<HTMLInputElement>('[name="secret-value"]')

  expect($NewInput?.readOnly).toBe(false)
  expect($NewInput?.value).toBe('plain-text-secret')
})

test('rememberFocus - uses the new value when an editable input becomes readonly', () => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: {
      escape: (value: string) => value,
    },
  })
  const $Viewlet = document.createElement('div')
  const $Input = document.createElement('input')
  $Input.name = 'secret-value'
  $Input.value = 'plain-text-secret-updated'
  $Viewlet.append($Input)
  document.body.append($Viewlet)
  $Input.focus()

  const dom = [
    {
      childCount: 1,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      inputType: 'password',
      name: 'secret-value',
      readOnly: true,
      type: VirtualDomElements.Input,
      value: 'masked',
    },
  ]

  const $NewViewlet = rememberFocus($Viewlet, dom, {}, 1)
  const $NewInput = (
    $NewViewlet as HTMLElement
  ).querySelector<HTMLInputElement>('[name="secret-value"]')

  expect($NewInput?.readOnly).toBe(true)
  expect($NewInput?.value).toBe('masked')
})

test('rememberFocus - retains a focused input in a temporarily hidden referenced pane', () => {
  Object.defineProperty(globalThis, 'CSS', {
    configurable: true,
    value: { escape: (value: string) => value },
  })
  const workbench = document.createElement('div')
  const editor = document.createElement('div')
  const input = document.createElement('textarea')
  input.name = 'editor'
  input.value = 'keep this selection'
  editor.append(input)
  workbench.append(editor)
  document.body.append(workbench)
  input.focus()
  input.setSelectionRange(2, 7)
  Instances.set(43, { state: { $Viewlet: editor } })

  const hidden = rememberFocus(
    workbench,
    [{ type: VirtualDomElements.Div, childCount: 0 }],
    {},
    1,
  )

  expect(editor.contains(input)).toBe(true)
  const restored = rememberFocus(
    hidden,
    [
      { type: VirtualDomElements.Div, childCount: 1 },
      { type: VirtualDomElements.Reference, uid: 43, childCount: 0 },
    ],
    {},
    1,
  )
  expect(restored.querySelector('[name="editor"]')).toBe(input)
  expect(input.value).toBe('keep this selection')
  expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7])
  restored.remove()
})
