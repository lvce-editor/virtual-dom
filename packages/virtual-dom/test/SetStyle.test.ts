/**
 * @jest-environment jsdom
 */
import { expect, test } from '@jest/globals'
import * as SetStyle from '../src/parts/SetStyle/SetStyle.ts'

test('setStyle - parses single style declaration', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, 'color: red')
  expect($Element.style.color).toBe('red')
})

test('setStyle - parses multiple style declarations', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, 'color: red; font-size: 14px; margin-top: 10px')
  expect($Element.style.color).toBe('red')
  expect($Element.style.fontSize).toBe('14px')
  expect($Element.style.marginTop).toBe('10px')
})

test('setStyle - handles whitespace around colons and semicolons', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, '  color  :  blue  ;  background  :  white  ')
  expect($Element.style.color).toBe('blue')
  expect($Element.style.background).toBe('white')
})

test('setStyle - ignores empty style string', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, '')
  expect($Element.style.length).toBe(0)
})

test('setStyle - handles style values with spaces', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, 'font-family: Arial, sans-serif; box-shadow: 0 0 10px rgba(0,0,0,0.5)')
  expect($Element.style.fontFamily).toBe('Arial, sans-serif')
  expect($Element.style.boxShadow).toBe('0 0 10px rgba(0,0,0,0.5)')
})

test('setStyle - ignores non-string input', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, null as any)
  expect($Element.style.length).toBe(0)
})

test('setStyle - handles css variables', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, '--my-color: red; color: var(--my-color)')
  expect($Element.style.getPropertyValue('--my-color')).toBe('red')
  expect($Element.style.color).toBe('var(--my-color)')
})

test('setStyle - handles trailing semicolon', () => {
  const $Element = document.createElement('div')
  SetStyle.setStyle($Element, 'color: green; padding: 5px;')
  expect($Element.style.color).toBe('green')
  expect($Element.style.padding).toBe('5px')
})
