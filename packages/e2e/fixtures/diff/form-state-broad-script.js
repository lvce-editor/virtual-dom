import {
  applyDiff,
  createCaseRoot,
  Form,
  optionValues,
  patchDom,
  text,
} from './broad-test-helpers.js'
import {
  applyPatch,
  registerEventListeners,
  renderInto,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const commands = []
setIpc({
  send(method, ...args) {
    commands.push({ method, args })
  },
})

const runCheckboxUserState = () => {
  const $mount = createCaseRoot('checkbox-user-state-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'state-checkbox',
      inputType: 'checkbox',
      name: 'feature',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'checkbox-status', childCount: 1 },
    text('before'),
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'state-checkbox',
      inputType: 'checkbox',
      name: 'feature',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'checkbox-status', childCount: 1 },
    text('after'),
  ]
  renderInto($mount, initialDom)
  const $checkbox = document.getElementById('state-checkbox')
  $checkbox.checked = true
  const patches = diffTree(initialDom, updatedDom)
  applyPatch($mount.firstElementChild, patches)
  return {
    checked: $checkbox.checked,
    statusText: document.getElementById('checkbox-status').textContent,
  }
}

const runCheckedValueUpdates = () => {
  const $mount = createCaseRoot('checked-value-updates-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 3 },
    {
      type: VirtualDomElements.Input,
      id: 'patched-checkbox',
      inputType: 'checkbox',
      checked: false,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'patched-radio-a',
      inputType: 'radio',
      name: 'patched-radio',
      checked: true,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'patched-radio-b',
      inputType: 'radio',
      name: 'patched-radio',
      checked: false,
      childCount: 0,
    },
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 3 },
    {
      type: VirtualDomElements.Input,
      id: 'patched-checkbox',
      inputType: 'checkbox',
      checked: true,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'patched-radio-a',
      inputType: 'radio',
      name: 'patched-radio',
      checked: false,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'patched-radio-b',
      inputType: 'radio',
      name: 'patched-radio',
      checked: true,
      childCount: 0,
    },
  ]
  applyDiff($mount, initialDom, updatedDom)
  return {
    checkboxChecked: document.getElementById('patched-checkbox').checked,
    radioAChecked: document.getElementById('patched-radio-a').checked,
    radioBChecked: document.getElementById('patched-radio-b').checked,
  }
}

const runRadioUserState = () => {
  const $mount = createCaseRoot('radio-user-state-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 3 },
    {
      type: VirtualDomElements.Input,
      id: 'theme-light',
      inputType: 'radio',
      name: 'theme',
      checked: true,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'theme-dark',
      inputType: 'radio',
      name: 'theme',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'theme-status', childCount: 1 },
    text('before'),
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 3 },
    {
      type: VirtualDomElements.Input,
      id: 'theme-light',
      inputType: 'radio',
      name: 'theme',
      checked: true,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'theme-dark',
      inputType: 'radio',
      name: 'theme',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'theme-status', childCount: 1 },
    text('after'),
  ]
  renderInto($mount, initialDom)
  document.getElementById('theme-dark').checked = true
  const patches = diffTree(initialDom, updatedDom)
  applyPatch($mount.firstElementChild, patches)
  return {
    lightChecked: document.getElementById('theme-light').checked,
    darkChecked: document.getElementById('theme-dark').checked,
    statusText: document.getElementById('theme-status').textContent,
  }
}

const runTextareaState = () => {
  const $mount = createCaseRoot('textarea-state-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.TextArea,
      id: 'notes-textarea',
      name: 'notes',
      style: 'width: 160px; height: 24px',
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'notes-status', childCount: 1 },
    text('before'),
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.TextArea,
      id: 'notes-textarea',
      name: 'notes',
      style: 'width: 160px; height: 24px',
      childCount: 0,
    },
    { type: VirtualDomElements.Span, id: 'notes-status', childCount: 1 },
    text('after'),
  ]
  renderInto($mount, initialDom)
  const $textarea = document.getElementById('notes-textarea')
  $textarea.focus()
  $textarea.value = 'line 1\nline 2\nline 3\nline 4\nline 5'
  $textarea.setSelectionRange(7, 13)
  $textarea.scrollTop = 12
  const patches = diffTree(initialDom, updatedDom)
  applyPatch($mount.firstElementChild, patches)
  return {
    activeElementId: document.activeElement.id,
    value: $textarea.value,
    selectionStart: $textarea.selectionStart,
    selectionEnd: $textarea.selectionEnd,
    scrollTop: $textarea.scrollTop,
    statusText: document.getElementById('notes-status').textContent,
  }
}

const createSelectDom = (statusText, includeUk = true) => [
  { type: VirtualDomElements.Div, childCount: 2 },
  { type: VirtualDomElements.Select, id: 'country-select-broad', childCount: includeUk ? 3 : 2 },
  { type: VirtualDomElements.Option, value: 'us', childCount: 1 },
  text(statusText === 'updated' ? 'United States updated' : 'United States'),
  ...(includeUk
    ? [
        { type: VirtualDomElements.Option, value: 'uk', childCount: 1 },
        text('United Kingdom'),
      ]
    : []),
  { type: VirtualDomElements.Option, value: 'ca', childCount: 1 },
  text('Canada'),
  { type: VirtualDomElements.Span, id: 'country-status', childCount: 1 },
  text(statusText),
]

const runSelectPreserve = () => {
  const $mount = createCaseRoot('select-preserve-case')
  const initialDom = createSelectDom('before')
  const updatedDom = createSelectDom('updated')
  renderInto($mount, initialDom)
  const $select = $mount.querySelector('#country-select-broad')
  $select.value = 'uk'
  const patches = diffTree(initialDom, updatedDom)
  applyPatch($mount.firstElementChild, patches)
  return {
    value: $select.value,
    optionValues: optionValues($select),
    firstOptionText: $select.options[0].textContent,
    statusText: $mount.querySelector('#country-status').textContent,
  }
}

const runSelectRemoval = () => {
  const $mount = createCaseRoot('select-removal-case')
  const initialDom = createSelectDom('before')
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    { type: VirtualDomElements.Select, id: 'country-select-broad', childCount: 2 },
    { type: VirtualDomElements.Option, value: 'us', childCount: 1 },
    text('United States'),
    { type: VirtualDomElements.Option, value: 'uk', childCount: 1 },
    text('United Kingdom'),
    { type: VirtualDomElements.Span, id: 'country-status', childCount: 1 },
    text('after'),
  ]
  renderInto($mount, initialDom)
  const $select = $mount.querySelector('#country-select-broad')
  $select.value = 'ca'
  const patches = diffTree(initialDom, updatedDom)
  applyPatch($mount.firstElementChild, patches)
  return {
    value: $select.value,
    selectedIndex: $select.selectedIndex,
    optionValues: optionValues($select),
  }
}

const runInputTypeChange = () => {
  const $mount = createCaseRoot('input-type-change-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Input,
      id: 'secret-input',
      inputType: 'text',
      value: 'secret',
      childCount: 0,
    },
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Input,
      id: 'secret-input',
      inputType: 'password',
      value: 'secret',
      childCount: 0,
    },
  ]
  applyDiff($mount, initialDom, updatedDom)
  const $input = document.getElementById('secret-input')
  return {
    type: $input.type,
    value: $input.value,
    typeAttribute: $input.getAttribute('type'),
  }
}

const runFormSubmit = () => {
  const $mount = createCaseRoot('form-submit-case')
  const uid = 901
  registerEventListeners(uid, [
    {
      name: 1,
      params: [
        'event.currentTarget.id',
        'event.currentTarget.dataset.formId',
        'event.currentTarget.elements.query.value',
      ],
      preventDefault: true,
    },
  ])
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    text('placeholder'),
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: Form,
      id: 'broad-form',
      'data-formId': 'primary',
      onSubmit: 1,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Input,
      inputType: 'text',
      name: 'query',
      value: 'typed value',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Button,
      inputType: 'submit',
      childCount: 1,
    },
    text('Submit'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)
  const $form = document.getElementById('broad-form')
  const event = new Event('submit', { bubbles: true, cancelable: true })
  const dispatchResult = $form.dispatchEvent(event)
  return {
    dispatchResult,
    defaultPrevented: event.defaultPrevented,
    command: commands.at(-1),
  }
}

window.__virtualDomBroadFormStateResult = {
  checkboxUserState: runCheckboxUserState(),
  checkedValueUpdates: runCheckedValueUpdates(),
  radioUserState: runRadioUserState(),
  textareaState: runTextareaState(),
  selectPreserve: runSelectPreserve(),
  selectRemoval: runSelectRemoval(),
  inputTypeChange: runInputTypeChange(),
  formSubmit: runFormSubmit(),
}
window.__virtualDomDiffTestComplete = true
