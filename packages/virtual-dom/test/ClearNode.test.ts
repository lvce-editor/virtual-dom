/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import { clearNode } from '../src/parts/ClearNode/ClearNode.ts'

test('clearNode - clears text content of empty node', () => {
  const $Node = document.createElement('div')
  clearNode($Node)
  expect($Node.textContent).toBe('')
})

test('clearNode - clears text content of node with text', () => {
  const $Node = document.createElement('div')
  $Node.textContent = 'Hello World'
  clearNode($Node)
  expect($Node.textContent).toBe('')
})

test('clearNode - clears child nodes', () => {
  const $Node = document.createElement('div')
  const $Child = document.createElement('span')
  $Child.textContent = 'Child Element'
  $Node.append($Child)
  clearNode($Node)
  expect($Node.textContent).toBe('')
  expect($Node.children.length).toBe(0)
})

test('clearNode - clears multiple nested children', () => {
  const $Node = document.createElement('div')
  const $Child1 = document.createElement('div')
  const $Child2 = document.createElement('span')
  const $GrandChild = document.createElement('p')
  $GrandChild.textContent = 'Nested Content'
  $Child2.append($GrandChild)
  $Child1.append($Child2)
  $Node.append($Child1)

  clearNode($Node)
  expect($Node.textContent).toBe('')
  expect($Node.children.length).toBe(0)
})
