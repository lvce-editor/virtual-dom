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
  readonly setup?: Sequence['setup']
  readonly expected: readonly Record<string, unknown>[]
}[] = [
  {
    name: 'clears a controlled input value and restores it',
    tag: 'Input',
    props: [{ value: 'initial' }, { value: '' }, { value: 'restored' }],
    read: { selector: '#target', properties: ['value'] },
    expected: [{ value: 'initial' }, { value: '' }, { value: 'restored' }],
  },
  {
    name: 'keeps a typed value while a placeholder is removed and restored',
    tag: 'Input',
    props: [
      { value: 'initial', placeholder: 'hint' },
      { value: 'initial' },
      { value: 'initial', placeholder: 'new hint' },
    ],
    setup: { properties: { value: 'typed' } },
    read: { selector: '#target', properties: ['value', 'placeholder'] },
    expected: [
      { value: 'typed', placeholder: 'hint' },
      { value: 'typed', placeholder: '' },
      { value: 'typed', placeholder: 'new hint' },
    ],
  },
  {
    name: 'preserves a backward input selection during title changes',
    tag: 'Input',
    props: [
      { value: 'abcdef', title: 'before' },
      { value: 'abcdef', title: 'after' },
      { value: 'abcdef' },
    ],
    setup: { focus: true, selection: [1, 5, 'backward'] },
    read: {
      selector: '#target',
      properties: [
        'value',
        'selectionStart',
        'selectionEnd',
        'selectionDirection',
        'title',
      ],
      focus: true,
    },
    expected: ['before', 'after', ''].map((title) => ({
      value: 'abcdef',
      selectionStart: 1,
      selectionEnd: 5,
      selectionDirection: 'backward',
      title,
      focused: true,
    })),
  },
  {
    name: 'preserves a textarea caret at the end across read-only toggles',
    tag: 'TextArea',
    props: [{ readOnly: false }, { readOnly: true }, { readOnly: false }],
    setup: {
      properties: { value: 'one\ntwo' },
      focus: true,
      selection: [7, 7, 'forward'],
    },
    read: {
      selector: '#target',
      properties: ['value', 'selectionStart', 'selectionEnd', 'readOnly'],
      focus: true,
    },
    expected: [false, true, false].map((readOnly) => ({
      value: 'one\ntwo',
      selectionStart: 7,
      selectionEnd: 7,
      readOnly,
      focused: true,
    })),
  },
  {
    name: 'patches a checkbox back to unchecked without clearing indeterminate state',
    tag: 'Input',
    props: [
      { inputType: 'checkbox', checked: false },
      { inputType: 'checkbox', checked: true },
      { inputType: 'checkbox', checked: false },
    ],
    setup: { properties: { indeterminate: true } },
    read: { selector: '#target', properties: ['checked', 'indeterminate'] },
    expected: [false, true, false].map((checked) => ({
      checked,
      indeterminate: true,
    })),
  },
  {
    name: 'preserves user checkbox state through disabled toggles',
    tag: 'Input',
    props: [
      { inputType: 'checkbox', checked: false, disabled: false },
      { inputType: 'checkbox', checked: false, disabled: true },
      { inputType: 'checkbox', checked: false, disabled: false },
    ],
    setup: { properties: { checked: true } },
    read: { selector: '#target', properties: ['checked', 'disabled'] },
    expected: [false, true, false].map((disabled) => ({
      checked: true,
      disabled,
    })),
  },
  {
    name: 'restores an enabled button after its disabled prop is removed',
    tag: 'Button',
    props: [{ disabled: true }, {}, { disabled: true }, { disabled: false }],
    read: {
      selector: '#target',
      properties: ['disabled'],
    },
    expected: [
      { disabled: true },
      { disabled: false },
      { disabled: true },
      { disabled: false },
    ],
  },
  {
    name: 'preserves typed text across text-search-password type transitions',
    tag: 'Input',
    props: [
      { inputType: 'text', value: 'initial' },
      { inputType: 'search', value: 'initial' },
      { inputType: 'password', value: 'initial' },
    ],
    setup: { properties: { value: 'typed secret' } },
    read: { selector: '#target', properties: ['type', 'value'] },
    expected: ['text', 'search', 'password'].map((type) => ({
      type,
      value: 'typed secret',
    })),
  },
  {
    name: 'changes number constraints without losing the valid zero value',
    tag: 'Input',
    props: [
      { inputType: 'number', value: '0', min: '-1', max: '1', step: '1' },
      { inputType: 'number', value: '0', min: '0', max: '10', step: '2' },
      { inputType: 'number', value: '0' },
    ],
    read: {
      selector: '#target',
      properties: [
        'value',
        'valueAsNumber',
        'min',
        'max',
        'step',
        'validity.valid',
      ],
    },
    expected: [
      {
        value: '0',
        valueAsNumber: 0,
        min: '-1',
        max: '1',
        step: '1',
        'validity.valid': true,
      },
      {
        value: '0',
        valueAsNumber: 0,
        min: '0',
        max: '10',
        step: '2',
        'validity.valid': true,
      },
      {
        value: '0',
        valueAsNumber: 0,
        min: '',
        max: '',
        step: '',
        'validity.valid': true,
      },
    ],
  },
  {
    name: 'updates native required validity when the prop is removed and restored',
    tag: 'Input',
    props: [
      { required: true, value: '' },
      { value: '' },
      { required: true, value: '' },
    ],
    read: {
      selector: '#target',
      properties: ['required', 'validity.valueMissing', 'value'],
    },
    expected: [true, false, true].map((required) => ({
      required,
      'validity.valueMissing': required,
      value: '',
    })),
  },
]

for (const scenario of cases) {
  test(`diff form sequence - ${scenario.name}`, async ({ page }) => {
    const result = await runSequence(page, {
      trees: scenario.props.map((props) =>
        element('Div', [element(scenario.tag, [], { id: 'target', ...props })]),
      ),
      read: scenario.read,
      ...(scenario.setup && { setup: scenario.setup }),
    })
    expect(result).toEqual(
      scenario.expected.map((snapshot) => ({ sameNode: true, ...snapshot })),
    )
  })
}
