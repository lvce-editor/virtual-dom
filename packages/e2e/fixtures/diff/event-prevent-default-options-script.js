import {
  renderInto,
  applyPatch,
  registerEventListeners,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')
const uid = 501
let wheelListenerOptions

registerEventListeners(uid, [
  {
    name: 1,
    params: [],
    preventDefault: true,
  },
  {
    name: 2,
    params: [],
  },
])

const originalAddEventListener = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = function (type, listener, options) {
  if (this.id === 'wheel-target' && type === 'wheel') {
    wheelListenerOptions = options
  }
  return originalAddEventListener.call(this, type, listener, options)
}

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Button,
    id: 'click-target',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Click',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    id: 'wheel-target',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Wheel',
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
    type: VirtualDomElements.Button,
    id: 'click-target',
    onClick: 1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Click',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    id: 'wheel-target',
    onWheel: 2,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Wheel',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches, {}, uid)
EventTarget.prototype.addEventListener = originalAddEventListener

const $clickTarget = document.getElementById('click-target')
const $wheelTarget = document.getElementById('wheel-target')
const clickEvent = new MouseEvent('click', {
  bubbles: true,
  cancelable: true,
})
const wheelEvent = new WheelEvent('wheel', {
  bubbles: true,
  cancelable: true,
})

window.__virtualDomPreventDefaultResult = {
  clickDispatchResult: $clickTarget.dispatchEvent(clickEvent),
  clickDefaultPrevented: clickEvent.defaultPrevented,
  wheelDispatchResult: $wheelTarget.dispatchEvent(wheelEvent),
  wheelDefaultPrevented: wheelEvent.defaultPrevented,
  wheelListenerOptions,
}
window.__virtualDomDiffTestComplete = true
