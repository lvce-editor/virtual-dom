import { test, expect } from '../src/fixtures.ts'
import {
  element,
  runSequence,
  type Sequence,
  type Tree,
} from './edge-case-sequence-helper.ts'

const cases: readonly {
  readonly name: string
  readonly tag: string
  readonly props: readonly NonNullable<Tree['props']>[]
  readonly read: Sequence['read']
  readonly expected: readonly Record<string, unknown>[]
}[] = [
  {
    name: 'removes and restores multiple classes on the same node',
    tag: 'Div',
    props: [{ className: 'one two' }, {}, { className: 'two three' }],
    read: { selector: '#target', attributes: ['class'] },
    expected: [{ class: 'one two' }, { class: null }, { class: 'two three' }],
  },
  {
    name: 'distinguishes empty data values from removed data attributes',
    tag: 'Div',
    props: [
      { 'data-state': 'ready' },
      { 'data-state': '' },
      {},
      { 'data-state': 'restored' },
    ],
    read: { selector: '#target', attributes: ['data-state'] },
    expected: [
      { 'data-state': 'ready' },
      { 'data-state': '' },
      { 'data-state': null },
      { 'data-state': 'restored' },
    ],
  },
  {
    name: 'round-trips false and zero data values',
    tag: 'Div',
    props: [
      { 'data-count': 1, 'data-active': true },
      { 'data-count': 0, 'data-active': false },
      {},
      { 'data-count': 2, 'data-active': true },
    ],
    read: { selector: '#target', attributes: ['data-count', 'data-active'] },
    expected: [
      { 'data-count': '1', 'data-active': 'true' },
      { 'data-count': '0', 'data-active': 'false' },
      { 'data-count': null, 'data-active': null },
      { 'data-count': '2', 'data-active': 'true' },
    ],
  },
  {
    name: 'removes and restores false ARIA state and a zero ARIA value',
    tag: 'Div',
    props: [
      { 'aria-expanded': true, 'aria-valuenow': 1 },
      { 'aria-expanded': false, 'aria-valuenow': 0 },
      {},
      { 'aria-expanded': true, 'aria-valuenow': 2 },
    ],
    read: {
      selector: '#target',
      attributes: ['aria-expanded', 'aria-valuenow'],
    },
    expected: [
      { 'aria-expanded': 'true', 'aria-valuenow': '1' },
      { 'aria-expanded': 'false', 'aria-valuenow': '0' },
      { 'aria-expanded': null, 'aria-valuenow': null },
      { 'aria-expanded': 'true', 'aria-valuenow': '2' },
    ],
  },
  {
    name: 'removes and restores mapped ARIA ID references',
    tag: 'Div',
    props: [
      { ariaLabelledBy: 'first second', ariaDescribedBy: 'help' },
      {},
      { ariaLabelledBy: 'third', ariaDescribedBy: 'details' },
    ],
    read: {
      selector: '#target',
      attributes: ['aria-labelledby', 'aria-describedby'],
    },
    expected: [
      { 'aria-labelledby': 'first second', 'aria-describedby': 'help' },
      { 'aria-labelledby': null, 'aria-describedby': null },
      { 'aria-labelledby': 'third', 'aria-describedby': 'details' },
    ],
  },
  {
    name: 'removes a label association before assigning another control',
    tag: 'Label',
    props: [{ htmlFor: 'first' }, {}, { htmlFor: 'second' }],
    read: { selector: '#target', attributes: ['for'], properties: ['htmlFor'] },
    expected: [
      { for: 'first', htmlFor: 'first' },
      { for: null, htmlFor: '' },
      { for: 'second', htmlFor: 'second' },
    ],
  },
  {
    name: 'round-trips a negative tab index through zero and absence',
    tag: 'Div',
    props: [{ tabIndex: -1 }, { tabIndex: 0 }, {}, { tabIndex: 2 }],
    read: {
      selector: '#target',
      attributes: ['tabindex'],
      properties: ['tabIndex'],
    },
    expected: [
      { tabindex: '-1', tabIndex: -1 },
      { tabindex: '0', tabIndex: 0 },
      { tabindex: null, tabIndex: -1 },
      { tabindex: '2', tabIndex: 2 },
    ],
  },
  {
    name: 'changes width units through zero and removal while preserving height',
    tag: 'Div',
    props: [
      { width: 20, height: 10 },
      { width: 0, height: 10 },
      { height: 10 },
      { width: '50%', height: 10 },
    ],
    read: { selector: '#target', properties: ['style.width', 'style.height'] },
    expected: [
      { 'style.width': '20px', 'style.height': '10px' },
      { 'style.width': '0px', 'style.height': '10px' },
      { 'style.width': '', 'style.height': '10px' },
      { 'style.width': '50%', 'style.height': '10px' },
    ],
  },
  {
    name: 'removes all inline styles before applying a different declaration',
    tag: 'Div',
    props: [
      { style: 'color: red; padding-left: 4px' },
      {},
      { style: 'color: blue' },
    ],
    read: {
      selector: '#target',
      properties: ['style.color', 'style.paddingLeft'],
    },
    expected: [
      { 'style.color': 'red', 'style.paddingLeft': '4px' },
      { 'style.color': '', 'style.paddingLeft': '' },
      { 'style.color': 'blue', 'style.paddingLeft': '' },
    ],
  },
  {
    name: 'preserves case-sensitive SVG attributes across removal and restoration',
    tag: 'Svg',
    props: [
      { viewBox: '0 0 10 10', preserveAspectRatio: 'xMinYMin meet' },
      {},
      { viewBox: '0 0 20 30', preserveAspectRatio: 'none' },
    ],
    read: {
      selector: '#target',
      attributes: ['viewBox', 'preserveAspectRatio'],
      properties: ['namespaceURI'],
    },
    expected: [
      {
        viewBox: '0 0 10 10',
        preserveAspectRatio: 'xMinYMin meet',
        namespaceURI: 'http://www.w3.org/2000/svg',
      },
      {
        viewBox: null,
        preserveAspectRatio: null,
        namespaceURI: 'http://www.w3.org/2000/svg',
      },
      {
        viewBox: '0 0 20 30',
        preserveAspectRatio: 'none',
        namespaceURI: 'http://www.w3.org/2000/svg',
      },
    ],
  },
]

for (const scenario of cases) {
  test(`diff attribute sequence - ${scenario.name}`, async ({ page }) => {
    const result = await runSequence(page, {
      trees: scenario.props.map((props) =>
        element('Div', [element(scenario.tag, [], { id: 'target', ...props })]),
      ),
      read: scenario.read,
    })
    expect(result).toEqual(
      scenario.expected.map((snapshot) => ({ sameNode: true, ...snapshot })),
    )
  })
}
