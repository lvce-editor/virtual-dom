import { patchDom, text } from './broad-test-helpers.js'
import { renderInto, VirtualDomElements } from '/dist/virtual-dom/dist/index.js'

const calls = []
const eventMap = {
  1: () => calls.push('focus'),
  2: () => calls.push('focusin'),
  3: () => calls.push('focusout'),
  4: () => calls.push('blur'),
  5: () => calls.push('keyup'),
  6: () => calls.push('selectionchange'),
  7: () => calls.push('mouseover'),
  8: () => calls.push('mouseout'),
  9: () => calls.push('mouseup'),
  10: () => calls.push('contextmenu'),
  11: () => calls.push('pointermove'),
  12: () => calls.push('pointerover'),
  13: () => calls.push('pointerout'),
  14: () => calls.push('dragenter'),
  15: () => calls.push('dragover'),
  16: () => calls.push('dragleave'),
  17: () => calls.push('dragend'),
}

const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
const updatedDom = [
  { type: VirtualDomElements.Div, childCount: 4 },
  {
    type: VirtualDomElements.Input,
    id: 'additional-focus-target',
    onFocus: 1,
    onFocusIn: 2,
    onFocusOut: 3,
    onBlur: 4,
    onKeyUp: 5,
    onSelectionChange: 6,
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    id: 'additional-mouse-target',
    onMouseOver: 7,
    onMouseOut: 8,
    onMouseUp: 9,
    onContextMenu: 10,
    childCount: 1,
  },
  text('mouse'),
  {
    type: VirtualDomElements.Div,
    id: 'additional-pointer-target',
    onPointerMove: 11,
    onPointerOver: 12,
    onPointerOut: 13,
    childCount: 1,
  },
  text('pointer'),
  {
    type: VirtualDomElements.Div,
    id: 'additional-drag-target',
    draggable: true,
    onDragEnter: 14,
    onDragOver: 15,
    onDragLeave: 16,
    onDragEnd: 17,
    childCount: 1,
  },
  text('drag'),
]
const removedDom = [
  { type: VirtualDomElements.Div, childCount: 4 },
  {
    type: VirtualDomElements.Input,
    id: 'additional-focus-target',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    id: 'additional-mouse-target',
    childCount: 1,
  },
  text('mouse'),
  {
    type: VirtualDomElements.Div,
    id: 'additional-pointer-target',
    childCount: 1,
  },
  text('pointer'),
  {
    type: VirtualDomElements.Div,
    id: 'additional-drag-target',
    draggable: true,
    childCount: 1,
  },
  text('drag'),
]

const dispatchEvents = () => {
  const $focusTarget = document.getElementById('additional-focus-target')
  $focusTarget.dispatchEvent(new FocusEvent('focus'))
  $focusTarget.dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  $focusTarget.dispatchEvent(new FocusEvent('focusout', { bubbles: true }))
  $focusTarget.dispatchEvent(new FocusEvent('blur'))
  $focusTarget.dispatchEvent(
    new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }),
  )
  $focusTarget.dispatchEvent(new Event('selectionchange', { bubbles: true }))

  const $mouseTarget = document.getElementById('additional-mouse-target')
  for (const type of ['mouseover', 'mouseout', 'mouseup', 'contextmenu']) {
    $mouseTarget.dispatchEvent(new MouseEvent(type, { bubbles: true }))
  }

  const $pointerTarget = document.getElementById('additional-pointer-target')
  for (const type of ['pointermove', 'pointerover', 'pointerout']) {
    $pointerTarget.dispatchEvent(new PointerEvent(type, { bubbles: true }))
  }

  const $dragTarget = document.getElementById('additional-drag-target')
  for (const type of ['dragenter', 'dragover', 'dragleave', 'dragend']) {
    $dragTarget.dispatchEvent(new DragEvent(type, { bubbles: true }))
  }
}

const $container = document.getElementById('diff-container')
renderInto($container, initialDom, eventMap)
const $root = $container.firstElementChild
let dom = patchDom($root, initialDom, updatedDom, eventMap)
dispatchEvents()
const afterAttach = [...calls]

patchDom($root, dom, removedDom, eventMap)
dispatchEvents()

window.__virtualDomAdditionalEventTypesResult = {
  afterAttach,
  afterRemoval: calls,
}
window.__virtualDomDiffTestComplete = true
