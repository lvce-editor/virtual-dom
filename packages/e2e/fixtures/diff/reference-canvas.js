import {
  renderInto,
  applyPatch,
  setViewletInstance,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const canvas = document.createElement('canvas')
canvas.width = 200
canvas.height = 150
// Windows WebKit does not expose transferred canvases. It still exercises the
// native canvas attribute update, while supporting browsers cover transfer too.
const offscreen = canvas.transferControlToOffscreen?.() || canvas
if (offscreen !== canvas) {
  offscreen.width = 400
  offscreen.height = 300
}
setViewletInstance('scene', { state: { $Viewlet: canvas } })
const initialDom = [
  {
    type: VirtualDomElements.Reference,
    uid: 'scene',
    id: 'scene',
    width: 400,
    height: 300,
    childCount: 0,
  },
]
renderInto(document.getElementById('container'), initialDom)
// Rendering the reference must not select a drawing context.
document.getElementById('start').addEventListener('click', () => {
  const context = offscreen.getContext('2d')
  context.fillStyle = 'blue'
  context.fillRect(0, 0, offscreen.width, offscreen.height)
  const pixel = context.getImageData(10, 10, 1, 1).data
  document.getElementById('pixel').textContent = pixel.join(',')
})

const replacement = document.createElement('canvas')
const replacementContext =
  replacement.transferControlToOffscreen?.() || replacement
replacementContext.width = 400
replacementContext.height = 300
setViewletInstance('replacement', { state: { $Viewlet: replacement } })
document.getElementById('swap').addEventListener('click', () => {
  const nextDom = [{ ...initialDom[0], uid: 'replacement' }]
  applyPatch(canvas, diffTree(initialDom, nextDom))
  const context = replacementContext.getContext('2d')
  context.fillStyle = 'red'
  context.fillRect(0, 0, replacementContext.width, replacementContext.height)
  document.getElementById('pixel').textContent = context
    .getImageData(10, 10, 1, 1)
    .data.join(',')
})
