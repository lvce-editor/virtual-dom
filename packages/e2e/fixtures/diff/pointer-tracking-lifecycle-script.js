import { applyDiff, createCaseRoot, text } from './broad-test-helpers.js'
import {
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
const pointerCaptureIds = []
const uid = 912

setIpc({
  send(method, ...args) {
    commands.push(args.slice(1))
  },
})

registerEventListeners(uid, [
  {
    name: 1,
    params: ['pointer-down'],
    trackPointerEvents: [2, 3],
  },
  {
    name: 2,
    params: ['pointer-move', 'event.clientX'],
  },
  {
    name: 3,
    params: ['pointer-up', 'event.clientX'],
  },
])

const $mount = createCaseRoot('pointer-tracking-lifecycle-case')
const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
const updatedDom = [
  { type: VirtualDomElements.Div, childCount: 1 },
  {
    type: VirtualDomElements.Div,
    id: 'pointer-track-target',
    onPointerDown: 1,
    childCount: 1,
  },
  text('Track pointer'),
]
applyDiff($mount, initialDom, updatedDom, {}, uid)

const $target = document.getElementById('pointer-track-target')
$target.setPointerCapture = (pointerId) => {
  pointerCaptureIds.push(pointerId)
}

const dispatchPointer = (type, pointerId, clientX) => {
  $target.dispatchEvent(
    new PointerEvent(type, {
      bubbles: true,
      clientX,
      pointerId,
    }),
  )
}

dispatchPointer('pointerdown', 7, 10)
dispatchPointer('pointermove', 7, 20)
dispatchPointer('pointerup', 7, 30)
dispatchPointer('pointermove', 7, 40)
$target.dispatchEvent(new Event('lostpointercapture'))

dispatchPointer('pointerdown', 8, 40)
dispatchPointer('pointermove', 8, 50)
$target.dispatchEvent(
  new PointerEvent('lostpointercapture', {
    clientX: 60,
    pointerId: 8,
  }),
)
dispatchPointer('pointermove', 8, 70)
dispatchPointer('pointerup', 8, 80)

window.__virtualDomPointerTrackingLifecycleResult = {
  commands,
  pointerCaptureIds,
}
window.__virtualDomDiffTestComplete = true
