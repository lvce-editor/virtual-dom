import { applyDiff, createCaseRoot, text } from './broad-test-helpers.js'
import {
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
const uid = 911

setIpc({
  send(method, ...args) {
    commands.push(args.slice(1))
  },
})

registerEventListeners(uid, [
  {
    name: 1,
    params: ['div'],
    preventDefault: 2,
    stopPropagation: true,
  },
  {
    name: 2,
    params: ['input'],
    preventDefault: 2,
    stopPropagation: true,
  },
  {
    name: 3,
    params: ['parent'],
  },
])

const $mount = createCaseRoot('event-conditional-prevention-case')
const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    id: 'event-parent',
    onClick: 3,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Div,
    id: 'conditional-div',
    onClick: 1,
    childCount: 1,
  },
  text('Div target'),
  {
    type: VirtualDomElements.Input,
    id: 'conditional-input',
    onClick: 2,
    childCount: 0,
  },
]
applyDiff($mount, initialDom, updatedDom, {}, uid)

const divEvent = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
})
const divDispatchResult = document
  .getElementById('conditional-div')
  .dispatchEvent(divEvent)

const inputEvent = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
})
const inputDispatchResult = document
  .getElementById('conditional-input')
  .dispatchEvent(inputEvent)

window.__virtualDomConditionalPreventionResult = {
  commands,
  divDefaultPrevented: divEvent.defaultPrevented,
  divDispatchResult,
  inputDefaultPrevented: inputEvent.defaultPrevented,
  inputDispatchResult,
}
window.__virtualDomDiffTestComplete = true
