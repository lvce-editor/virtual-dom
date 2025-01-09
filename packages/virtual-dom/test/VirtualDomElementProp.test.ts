/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import * as VirtualDomElementProp from '../src/parts/VirtualDomElementProp/VirtualDomElementProp.ts'

test('maskImage - sets mask image style', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'maskImage', 'test.svg', {})
  expect($Element.style.maskImage).toBe(`url('test.svg')`)
  expect($Element.style.webkitMaskImage).toBe(`url('test.svg')`)
})

test('numeric style properties - converts numbers to pixels', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'paddingLeft', 10, {})
  VirtualDomElementProp.setProp($Element, 'marginTop', 20, {})
  expect($Element.style.paddingLeft).toBe('10px')
  expect($Element.style.marginTop).toBe('20px')
})

test('string style properties - uses raw value', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'paddingRight', '15em', {})
  expect($Element.style.paddingRight).toBe('15em')
})

test('translate - sets translate style', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp(
    $Element,
    'translate',
    'transform(10px, 20px)',
    {},
  )
  expect($Element.style.translate).toBe('transform(10px, 20px)')
})

test('width/height - handles image elements differently', () => {
  const $Element = document.createElement('img')
  VirtualDomElementProp.setProp($Element, 'width', 100, {})
  VirtualDomElementProp.setProp($Element, 'height', 200, {})
  expect($Element.width).toBe(100)
  expect($Element.height).toBe(200)
})

test('width/height - handles non-image elements', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'width', 100, {})
  VirtualDomElementProp.setProp($Element, 'height', '50%', {})
  expect($Element.style.width).toBe('100px')
  expect($Element.style.height).toBe('50%')
})

test('style property - throws error', () => {
  const $Element = document.createElement('div')
  expect(() => {
    VirtualDomElementProp.setProp($Element, 'style', {}, {})
  }).toThrow('style property is not supported')
})

test('aria attributes - sets and removes attributes', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'ariaOwns', 'test-id', {})
  expect($Element.getAttribute('aria-owns')).toBe('test-id')

  VirtualDomElementProp.setProp($Element, 'ariaOwns', '', {})
  expect($Element.hasAttribute('aria-owns')).toBe(false)

  VirtualDomElementProp.setProp($Element, 'ariaLabelledBy', 'label-id', {})
  expect($Element.getAttribute('aria-labelledby')).toBe('label-id')
})

test('input type - sets input type', () => {
  const $Element = document.createElement('input')
  VirtualDomElementProp.setProp($Element, 'inputType', 'checkbox', {})
  expect($Element.type).toBe('checkbox')
})

test('data attributes - sets dataset values', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'data-testid', 'test-123', {})
  expect($Element.dataset.testid).toBe('test-123')
})

test('default behavior - sets property directly', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'title', 'Test Title', {})
  expect($Element.title).toBe('Test Title')
})

test('setting id to undefined removes id', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'id', undefined, {})
  expect($Element.id).toBe('')
})

test('setting id to empty string removes id', () => {
  const $Element = document.createElement('div')
  VirtualDomElementProp.setProp($Element, 'id', '', {})
  expect($Element.id).toBe('')
})
