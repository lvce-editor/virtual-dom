import { expect, test } from '@jest/globals'
import * as ElementTagMap from '../src/parts/ElementTagMap/ElementTagMap.ts'
import * as ElementTags from '../src/parts/ElementTags/ElementTags.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('ElementTagMap - maps audio element', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Audio)).toBe(
    ElementTags.Audio,
  )
})

test('ElementTagMap - maps div element', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Div)).toBe(
    ElementTags.Div,
  )
})

test('ElementTagMap - maps heading elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.H1)).toBe(
    ElementTags.H1,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.H2)).toBe(
    ElementTags.H2,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.H3)).toBe(
    ElementTags.H3,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.H4)).toBe(
    ElementTags.H4,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.H5)).toBe(
    ElementTags.H5,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.H6)).toBe(
    ElementTags.H6,
  )
})

test('ElementTagMap - maps table elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Table)).toBe(
    ElementTags.Table,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.TBody)).toBe(
    ElementTags.TBody,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.THead)).toBe(
    ElementTags.THead,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Tr)).toBe(
    ElementTags.Tr,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Td)).toBe(
    ElementTags.Td,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Th)).toBe(
    ElementTags.Th,
  )
})

test('ElementTagMap - maps form elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Input)).toBe(
    ElementTags.Input,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Button)).toBe(
    ElementTags.Button,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.TextArea)).toBe(
    ElementTags.TextArea,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Select)).toBe(
    ElementTags.Select,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Option)).toBe(
    ElementTags.Option,
  )
})

test('ElementTagMap - maps semantic elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Article)).toBe(
    ElementTags.Article,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Section)).toBe(
    ElementTags.Section,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Nav)).toBe(
    ElementTags.Nav,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Header)).toBe(
    ElementTags.Header,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Footer)).toBe(
    ElementTags.Footer,
  )
})

test('ElementTagMap - throws error for unknown element type', () => {
  expect(() => ElementTagMap.getElementTag(999)).toThrow(
    'element tag not found 999',
  )
})
