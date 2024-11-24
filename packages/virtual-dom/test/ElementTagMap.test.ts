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

test('ElementTagMap - maps list elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Ul)).toBe(
    ElementTags.Ul,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Ol)).toBe(
    ElementTags.Ol,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Li)).toBe(
    ElementTags.Li,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Dl)).toBe(
    ElementTags.Dl,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Dd)).toBe(
    ElementTags.Dd,
  )
})

test('ElementTagMap - maps text formatting elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.P)).toBe(ElementTags.P)
  expect(ElementTagMap.getElementTag(VirtualDomElements.Pre)).toBe(
    ElementTags.Pre,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Span)).toBe(
    ElementTags.Span,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.I)).toBe(ElementTags.I)
  expect(ElementTagMap.getElementTag(VirtualDomElements.Kbd)).toBe(
    ElementTags.Kbd,
  )
})

test('ElementTagMap - maps media elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Img)).toBe(
    ElementTags.Img,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Video)).toBe(
    ElementTags.Video,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Figure)).toBe(
    ElementTags.Figure,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Figcaption)).toBe(
    ElementTags.Figcaption,
  )
})

test('ElementTagMap - maps inline elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.A)).toBe(ElementTags.A)
  expect(ElementTagMap.getElementTag(VirtualDomElements.Br)).toBe(
    ElementTags.Br,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Cite)).toBe(
    ElementTags.Cite,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Data)).toBe(
    ElementTags.Data,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Time)).toBe(
    ElementTags.Time,
  )
})

test('ElementTagMap - maps table structure elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.ColGroup)).toBe(
    ElementTags.ColGroup,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Col)).toBe(
    ElementTags.Col,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Tfoot)).toBe(
    ElementTags.Tfoot,
  )
})

test('ElementTagMap - maps text modification elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Ins)).toBe(
    ElementTags.Ins,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Del)).toBe(
    ElementTags.Del,
  )
})

test('ElementTagMap - maps structural elements', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Hr)).toBe(
    ElementTags.Hr,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Aside)).toBe(
    ElementTags.Aside,
  )
  expect(ElementTagMap.getElementTag(VirtualDomElements.Search)).toBe(
    ElementTags.Search,
  )
})
