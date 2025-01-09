/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { rememberFocus } from '../src/parts/RememberFocus/RememberFocus.ts'

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
      type: 4, // Div
      childCount: 0,
      role: 'tree',
      tabIndex: 0,
      className: 'tree',
    },
  ]

  // Update the DOM while preserving focus
  const $NewViewlet = rememberFocus($Viewlet, dom, {})

  // Verify focus was preserved
  expect(document.activeElement).toBe($NewViewlet)
})
