/**
 * @jest-environment jsdom
 */
import { expect, jest, test } from '@jest/globals'
import { createRenderer } from '../src/parts/CreateRenderer/CreateRenderer.ts'
import * as Instances from '../src/parts/Instances/Instances.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

const div = { type: VirtualDomElements.Div, childCount: 1 }
const text = { type: VirtualDomElements.Text, text: 'hello', childCount: 0 }

test('reuses clean nodes and removes listeners when disposing a view', () => {
  const renderer = createRenderer({ cache: { dom: 100, text: 100 } })
  const listener = jest.fn()
  const root = renderer.render(
    [
      {
        ...div,
        id: 'old',
        className: 'old',
        style: { color: 'red' },
        onClick: 'click',
      },
      text,
    ],
    {},
    { click: listener },
  )
  const element = root.firstChild as HTMLElement
  const child = element.firstChild as Text
  element.click()
  expect(listener).toHaveBeenCalledTimes(1)
  renderer.dispose(root)
  expect(child.data).toBe('')
  expect(element.attributes).toHaveLength(0)
  element.click()
  expect(listener).toHaveBeenCalledTimes(1)
  const next = renderer.render([div, { ...text, text: 'new' }])
  expect(next.firstChild).toBe(element)
  expect(element.firstChild).toBe(child)
  expect(next.textContent).toBe('new')
  expect(element.id).toBe('')
})

test('bounds each cache and ignores repeated disposal', () => {
  const renderer = createRenderer({ cache: { dom: 1, text: 1 } })
  const root = renderer.render([div, text, div, text])
  const oldElements = Array.from(root.children)
  const oldTexts = oldElements.map((element) => element.firstChild)
  renderer.dispose(root)
  renderer.dispose(root)
  const next = renderer.render([div, text, div, text])
  expect(
    Array.from(next.children).filter((element) =>
      oldElements.includes(element),
    ),
  ).toHaveLength(1)
  expect(
    Array.from(next.children).filter((element) =>
      oldTexts.includes(element.firstChild),
    ),
  ).toHaveLength(1)
})

test('cache is disabled by default and can be cleared explicitly', () => {
  for (const renderer of [
    createRenderer(),
    createRenderer({ cache: { dom: 1, text: 1 } }),
  ]) {
    const root = renderer.render([div, text])
    const element = root.firstChild
    renderer.dispose(root)
    renderer.clearCache()
    expect(renderer.render([div, text]).firstChild).not.toBe(element)
  }
})

test('does not recycle stateful or unknown properties, or mismatched tags', () => {
  const renderer = createRenderer({ cache: { dom: 10 } })
  for (const props of [
    { type: VirtualDomElements.Input, value: 'secret' },
    { type: VirtualDomElements.Div, custom: 'secret' },
  ]) {
    const root = renderer.render([{ ...props, childCount: 0 }])
    const element = root.firstChild
    renderer.dispose(root)
    expect(
      renderer.render([{ type: props.type, childCount: 0 }]).firstChild,
    ).not.toBe(element)
  }
  const root = renderer.render([{ ...div, childCount: 0 }])
  const element = root.firstChild
  renderer.dispose(root)
  expect(
    renderer.render([{ type: VirtualDomElements.Span, childCount: 0 }])
      .firstChild,
  ).not.toBe(element)
})

test('reference subtrees remain intact and are never cached', () => {
  const renderer = createRenderer({ cache: { dom: 10, text: 10 } })
  const reference = document.createElement('div')
  reference.textContent = 'foreign'
  Instances.set(123, { state: { $Viewlet: reference } })
  const root = renderer.render([
    { type: VirtualDomElements.Reference, uid: 123, childCount: 0 },
  ])
  renderer.dispose(root)
  expect(reference.textContent).toBe('foreign')
  expect(renderer.render([{ ...div, childCount: 0 }]).firstChild).not.toBe(
    reference,
  )
})

test.each([-1, 0.5, Infinity, NaN])('rejects invalid capacity %s', (limit) => {
  expect(() => createRenderer({ cache: { dom: limit } })).toThrow(RangeError)
  expect(() => createRenderer({ cache: { text: limit } })).toThrow(RangeError)
})
