/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import * as VirtualDomElementProp from '../src/parts/VirtualDomElementProp/VirtualDomElementProp.ts'

test('maskImage', () => {
  const $Element = document.createElement('div')
  const key = 'maskImage'
  const value = 'example.svg'
  const eventMap = {}
  VirtualDomElementProp.setProp($Element, key, value, eventMap)
  expect($Element.style.maskImage).toBe(`url('example.svg')`)
})

test('paddingLeft', () => {
  const $Element = document.createElement('div')
  const key = 'paddingLeft'
  const value = '10px'
  const eventMap = {}
  VirtualDomElementProp.setProp($Element, key, value, eventMap)
  expect($Element.style.paddingLeft).toBe(`10px`)
})

test('paddingRight', () => {
  const $Element = document.createElement('div')
  const key = 'paddingRight'
  const value = '10px'
  const eventMap = {}
  VirtualDomElementProp.setProp($Element, key, value, eventMap)
  expect($Element.style.paddingRight).toBe(`10px`)
})
