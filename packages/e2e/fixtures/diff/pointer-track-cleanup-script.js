import { applyDiff, createCaseRoot, text } from './broad-test-helpers.js'
import {
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
setIpc({
  send(method, ...args) {
    commands.push({ method, args })
  },
})

const getCommandNames = () => {
  return commands.map((command) => command.args[1])
}

const createPointerEvent = (type, clientY) => {
  return new PointerEvent(type, {
    bubbles: true,
    clientY,
    pointerId: 1,
  })
}

const runPointerTrackCase = (caseId, endEventType) => {
  commands.length = 0
  const $mount = createCaseRoot(`${caseId}-mount`)
  const uid = endEventType === 'pointerup' ? 920 : 921
  const addedListeners = []
  const removedListeners = []
  const originalAddEventListener = EventTarget.prototype.addEventListener
  const originalRemoveEventListener = EventTarget.prototype.removeEventListener
  const originalSetPointerCapture = Element.prototype.setPointerCapture

  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (this.id === caseId) {
      addedListeners.push(type)
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
  EventTarget.prototype.removeEventListener = function (
    type,
    listener,
    options,
  ) {
    if (this.id === caseId) {
      removedListeners.push(type)
    }
    return originalRemoveEventListener.call(this, type, listener, options)
  }
  Element.prototype.setPointerCapture = function () {}

  registerEventListeners(uid, [
    {
      name: 1,
      params: ['handlePointerDown'],
      trackPointerEvents: [2, 3],
    },
    {
      name: 2,
      params: ['handlePointerMove', 'event.clientY'],
    },
    {
      name: 3,
      params: ['handlePointerUp'],
    },
  ])

  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Button,
      id: caseId,
      onPointerDown: 1,
      childCount: 1,
    },
    text('pointer target'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)

  const $target = document.getElementById(caseId)
  $target.dispatchEvent(createPointerEvent('pointerdown', 10))
  $target.dispatchEvent(createPointerEvent('pointermove', 20))
  $target.dispatchEvent(createPointerEvent(endEventType, 30))
  $target.dispatchEvent(createPointerEvent('pointermove', 40))

  EventTarget.prototype.addEventListener = originalAddEventListener
  EventTarget.prototype.removeEventListener = originalRemoveEventListener
  Element.prototype.setPointerCapture = originalSetPointerCapture

  return {
    addedListeners,
    removedListeners,
    commandNames: getCommandNames(),
  }
}

window.__virtualDomPointerTrackCleanupResult = {
  pointerUp: runPointerTrackCase('pointerup-cleanup-target', 'pointerup'),
  lostPointerCapture: runPointerTrackCase(
    'lostpointercapture-cleanup-target',
    'lostpointercapture',
  ),
}
window.__virtualDomDiffTestComplete = true
