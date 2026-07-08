import { expect, test } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/constants'
import { validate } from '../src/index.ts'

test('validate - empty array', () => {
  expect(validate([])).toBe(true)
})

test('validate - single node', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: 0,
      },
    ]),
  ).toBe(true)
})

test('validate - nested nodes', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: 2,
      },
      {
        type: VirtualDomElements.Span,
        childCount: 1,
      },
      {
        type: VirtualDomElements.Text,
        childCount: 0,
      },
      {
        type: VirtualDomElements.Button,
        childCount: 0,
      },
    ]),
  ).toBe(true)
})

test('validate - fragment nodes', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Text,
        childCount: 0,
      },
      {
        type: VirtualDomElements.Div,
        childCount: 0,
      },
    ]),
  ).toBe(true)
})

test('validate - non array', () => {
  expect(validate(undefined)).toBe(false)
})

test('validate - missing type', () => {
  expect(
    validate([
      {
        childCount: 0,
      },
    ]),
  ).toBe(false)
})

test('validate - invalid type', () => {
  expect(
    validate([
      {
        type: 999,
        childCount: 0,
      },
    ]),
  ).toBe(false)
})

test('validate - type is not a number', () => {
  expect(
    validate([
      {
        type: 'div',
        childCount: 0,
      },
    ]),
  ).toBe(false)
})

test('validate - missing child count', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
      },
    ]),
  ).toBe(false)
})

test('validate - negative child count', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: -1,
      },
    ]),
  ).toBe(false)
})

test('validate - decimal child count', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: 0.5,
      },
    ]),
  ).toBe(false)
})

test('validate - child count exceeds remaining nodes', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: 1,
      },
    ]),
  ).toBe(false)
})

test('validate - nested child count exceeds remaining nodes', () => {
  expect(
    validate([
      {
        type: VirtualDomElements.Div,
        childCount: 1,
      },
      {
        type: VirtualDomElements.Span,
        childCount: 1,
      },
    ]),
  ).toBe(false)
})
