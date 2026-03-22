import {
  renderInto,
  applyPatch,
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const commands = []
const ipc = {
  send(method, ...args) {
    commands.push({ method, args })
  },
}

setIpc(ipc)

registerEventListeners(99, [
  {
    name: 1,
    params: ['event.currentTarget.abc.value'],
  },
  {
    name: 2,
    params: [
      'event.currentTarget.dataset.groupIndex',
      'event.currentTarget.className',
      'event.currentTarget.dataset.missingKey',
    ],
  },
])

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'initial',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: 78,
    id: 'test-form',
    action: '#',
    onSubmit: 1,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Input,
    name: 'abc',
    value: 'first-value',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Button,
    inputType: 'submit',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Submit',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Button,
    id: 'dataset-button',
    className: 'dataset-button',
    'data-groupIndex': '42',
    onClick: 2,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    id: 'dataset-child',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'click me',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches, {}, 99)

const $form = document.getElementById('test-form')
const $input = $form.elements.abc
const $child = document.getElementById('dataset-child')

$input.value = 'new-value'

$form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
$child.click()

window.__virtualDomDiffTestCommands = commands
window.__virtualDomDiffTestComplete = true
