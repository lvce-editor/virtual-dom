import * as FunctionalPointerEvents from '../FunctionalPointerEvents/FunctionalPointerEvents.ts'

export const attachPointerTrackEvent = ($Node, value) => {
  const fn = FunctionalPointerEvents.create(
    (event) => {
      const { clientX, clientY } = event
      RendererWorker.send(
        'ColorPicker.handleSliderPointerDown',
        clientX,
        clientY,
      )
    },
    (event) => {
      const { clientX, clientY } = event
      RendererWorker.send(
        'ColorPicker.handleSliderPointerMove',
        clientX,
        clientY,
      )
    },
    () => {
      // ignore
    },
  )
  $Node.addEventListener('pointerdown', fn)
}
