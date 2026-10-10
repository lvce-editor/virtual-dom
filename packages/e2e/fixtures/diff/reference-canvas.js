import {
  renderInto,
  setViewletInstance,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const canvas = document.createElement('canvas')
canvas.width = 200
canvas.height = 150
const offscreen = canvas.transferControlToOffscreen()
offscreen.width = 400
offscreen.height = 300
setViewletInstance('scene', { state: { $Viewlet: canvas } })
renderInto(document.getElementById('container'), [
  {
    type: VirtualDomElements.Reference,
    uid: 'scene',
    id: 'scene',
    width: 400,
    height: 300,
    childCount: 0,
  },
])
// Rendering the reference must not select a drawing context.
document.getElementById('start').addEventListener('click', () => {
  const context = offscreen.getContext('webgl2')
  context.clearColor(0, 0, 1, 1)
  context.clear(context.COLOR_BUFFER_BIT)
  const pixel = new Uint8Array(4)
  context.readPixels(10, 10, 1, 1, context.RGBA, context.UNSIGNED_BYTE, pixel)
  document.getElementById('pixel').textContent = pixel.join(',')
})
