import { applyDiff } from './broad-test-helpers.js'
import { VirtualDomElements } from '/dist/virtual-dom/dist/index.js'

const element = (type, properties = {}, children = []) => ({
  type,
  properties,
  children,
})

const text = (value) => element(VirtualDomElements.Text, { text: value })

const flatten = (node) => {
  const { type, properties, children } = node
  return [
    {
      type,
      ...properties,
      childCount: children.length,
    },
    ...children.flatMap(flatten),
  ]
}

const div = (children) => element(VirtualDomElements.Div, {}, children)
const paragraph = (value, properties = {}) =>
  element(VirtualDomElements.P, properties, [text(value)])
const section = (children, properties = {}) =>
  element(VirtualDomElements.Section, properties, children)
const span = (value, properties = {}) =>
  element(VirtualDomElements.Span, properties, [text(value)])

const cases = {
  'nested-prepend-text': {
    initial: div([section([span('Tail')])]),
    updated: div([section([text('Lead '), span('Tail')])]),
  },
  'nested-append-text': {
    initial: div([section([span('Lead')])]),
    updated: div([section([span('Lead'), text(' Tail')])]),
  },
  'nested-remove-leading-text': {
    initial: div([section([text('Remove '), span('Keep')])]),
    updated: div([section([span('Keep')])]),
  },
  'nested-remove-trailing-text': {
    initial: div([section([span('Keep'), text(' Remove')])]),
    updated: div([section([span('Keep')])]),
  },
  'replace-first-element': {
    initial: div([
      paragraph('Old', { id: 'first' }),
      span('Stable', { id: 'second' }),
    ]),
    updated: div([
      section([text('New')], { id: 'first' }),
      span('Stable', { id: 'second' }),
    ]),
  },
  'replace-last-element': {
    initial: div([
      span('Stable', { id: 'first' }),
      paragraph('Old', { id: 'second' }),
    ]),
    updated: div([
      span('Stable', { id: 'first' }),
      section([text('New')], { id: 'second' }),
    ]),
  },
  'populate-empty-nested-element': {
    initial: div([
      section([], { id: 'target' }),
      span('Before', { id: 'status' }),
    ]),
    updated: div([
      section([paragraph('Added')], { id: 'target' }),
      span('After', { id: 'status' }),
    ]),
  },
  'empty-nested-element': {
    initial: div([
      section([paragraph('Remove')], { id: 'target' }),
      span('Stable', { id: 'status', className: 'before' }),
    ]),
    updated: div([
      section([], { id: 'target' }),
      span('Stable', { id: 'status', className: 'after' }),
    ]),
  },
  'increase-nesting-depth': {
    initial: div([
      span('Content', { id: 'target' }),
      paragraph('Stable', { id: 'sibling' }),
    ]),
    updated: div([
      section([span('Content')], { id: 'target' }),
      paragraph('Stable', { id: 'sibling' }),
    ]),
  },
  'decrease-nesting-depth': {
    initial: div([
      section([span('Content')], { id: 'target' }),
      paragraph('Stable', { id: 'sibling' }),
    ]),
    updated: div([
      span('Content', { id: 'target' }),
      paragraph('Stable', { id: 'sibling' }),
    ]),
  },
}

const caseName = location.hash.slice(1)
const scenario = cases[caseName]

if (!scenario) {
  throw new Error(`Unknown structural edge case: ${caseName}`)
}

const $container = document.getElementById('diff-container')
applyDiff($container, flatten(scenario.initial), flatten(scenario.updated))

globalThis.__virtualDomDiffTestComplete = true
