import { applyDiff, createCaseRoot, text } from './broad-test-helpers.js'
import {
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
const uid = 910

setIpc({
  send(method, ...args) {
    commands.push(args.slice(1))
  },
})

registerEventListeners(uid, [
  {
    name: 1,
    params: ['event.target.checked', 'event.target.name', 'event.target.value'],
  },
  {
    name: 2,
    params: [
      'event.key',
      'event.target.selectionStart',
      'event.target.selectionEnd',
      'event.defaultPrevented',
      'event.isTrusted',
    ],
  },
  {
    name: 3,
    params: ['event.target.href', 'event.detail', 'event.x', 'event.y'],
  },
  {
    name: 4,
    params: ['event.target.src'],
  },
])

const $mount = createCaseRoot('event-argument-coverage-case')
const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
const updatedDom = [
  { type: VirtualDomElements.Div, childCount: 4 },
  {
    type: VirtualDomElements.Input,
    id: 'event-checkbox',
    inputType: 'checkbox',
    name: 'feature-enabled',
    value: 'enabled',
    onChange: 1,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Input,
    id: 'event-text-input',
    name: 'query',
    value: 'abcd',
    onKeyDown: 2,
    childCount: 0,
  },
  {
    type: VirtualDomElements.A,
    id: 'event-link',
    href: '/docs',
    onDblClick: 3,
    childCount: 1,
  },
  text('Docs'),
  {
    type: VirtualDomElements.Img,
    id: 'event-image',
    src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>',
    onClick: 4,
    childCount: 0,
  },
]
applyDiff($mount, initialDom, updatedDom, {}, uid)

const $checkbox = document.getElementById('event-checkbox')
$checkbox.checked = true
$checkbox.dispatchEvent(new Event('change', { bubbles: true }))

const $input = document.getElementById('event-text-input')
$input.setSelectionRange(1, 3)
const keyboardEvent = new KeyboardEvent('keydown', {
  bubbles: true,
  cancelable: true,
  key: 'ArrowRight',
})
keyboardEvent.preventDefault()
$input.dispatchEvent(keyboardEvent)

document.getElementById('event-link').dispatchEvent(
  new MouseEvent('dblclick', {
    bubbles: true,
    clientX: 17,
    clientY: 19,
    detail: 2,
  }),
)

document
  .getElementById('event-image')
  .dispatchEvent(new MouseEvent('click', { bubbles: true }))

window.__virtualDomEventArgumentCoverageResult = {
  checkbox: commands[0],
  keyboard: commands[1],
  link: commands[2],
  image: commands[3],
}
window.__virtualDomDiffTestComplete = true
