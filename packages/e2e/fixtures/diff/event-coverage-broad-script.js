import {
  applyDiff,
  createCaseRoot,
  patchDom,
  text,
} from './broad-test-helpers.js'
import {
  registerEventListeners,
  renderInto,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
setIpc({
  send(method, ...args) {
    commands.push({ method, args })
  },
})

const commandArgs = () => commands.at(-1)?.args.slice(1)

const runRegisteredEventArgs = () => {
  const $mount = createCaseRoot('registered-event-args-case')
  const uid = 902
  registerEventListeners(uid, [
    {
      name: 1,
      params: ['event.data', 'event.inputType', 'event.target.value'],
    },
    {
      name: 2,
      params: ['event.data', 'event.inputType', 'event.target.value'],
      preventDefault: true,
    },
    {
      name: 3,
      params: ['event.deltaX', 'event.deltaY', 'event.deltaMode'],
    },
    {
      name: 4,
      params: [
        'event.clientX',
        'event.clientY',
        'event.button',
        'event.altKey',
        'event.ctrlKey',
        'event.shiftKey',
      ],
    },
    {
      name: 5,
      params: [
        'event.target.nodeName',
        'event.target.className',
        'event.currentTarget.id',
        'event.currentTarget.dataset.parent',
      ],
    },
    {
      name: 6,
      params: ['event.target.scrollTop'],
    },
  ])
  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 6 },
    {
      type: VirtualDomElements.Input,
      id: 'input-event-target',
      onInput: 1,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'before-input-target',
      onBeforeInput: 2,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      id: 'wheel-event-target',
      onWheel: 3,
      childCount: 1,
    },
    text('wheel'),
    {
      type: VirtualDomElements.Button,
      id: 'pointer-event-target',
      onPointerDown: 4,
      childCount: 1,
    },
    text('pointer'),
    {
      type: VirtualDomElements.Div,
      id: 'nested-current-target',
      className: 'parent-class',
      'data-parent': 'outer',
      onClick: 5,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Span,
      id: 'nested-event-target',
      className: 'child-class',
      childCount: 1,
    },
    text('child'),
    {
      type: VirtualDomElements.Div,
      id: 'scroll-event-target',
      style: 'height: 20px; overflow: auto',
      onScroll: 6,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      style: 'height: 80px',
      childCount: 1,
    },
    text('scroll body'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)

  const $input = document.getElementById('input-event-target')
  $input.value = 'abc'
  $input.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      data: 'c',
      inputType: 'insertText',
    }),
  )
  const inputArgs = commandArgs()

  const $beforeInput = document.getElementById('before-input-target')
  $beforeInput.value = 'draft'
  const beforeInputEvent = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    data: 'x',
    inputType: 'insertText',
  })
  const beforeInputDispatchResult = $beforeInput.dispatchEvent(beforeInputEvent)
  const beforeInputArgs = commandArgs()

  document.getElementById('wheel-event-target').dispatchEvent(
    new WheelEvent('wheel', {
      bubbles: true,
      deltaMode: 1,
      deltaX: 5,
      deltaY: -9,
    }),
  )
  const wheelArgs = commandArgs()

  document.getElementById('pointer-event-target').dispatchEvent(
    new PointerEvent('pointerdown', {
      bubbles: true,
      clientX: 11,
      clientY: 12,
      button: 1,
      altKey: true,
      ctrlKey: true,
      shiftKey: true,
    }),
  )
  const pointerArgs = commandArgs()

  document.getElementById('nested-event-target').click()
  const nestedClickArgs = commandArgs()

  const $scrollTarget = document.getElementById('scroll-event-target')
  $scrollTarget.scrollTop = 33
  $scrollTarget.dispatchEvent(new Event('scroll', { bubbles: true }))
  const scrollArgs = commandArgs()

  return {
    inputArgs,
    beforeInputArgs,
    beforeInputDefaultPrevented: beforeInputEvent.defaultPrevented,
    beforeInputDispatchResult,
    wheelArgs,
    pointerArgs,
    nestedClickArgs,
    scrollArgs,
  }
}

const runListenerOptions = () => {
  const $mount = createCaseRoot('listener-options-case')
  const uid = 903
  const listenerOptions = []
  const originalAddEventListener = EventTarget.prototype.addEventListener
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    if (this.id === 'capture-target' || this.id === 'passive-target') {
      listenerOptions.push({ id: this.id, type, options })
    }
    return originalAddEventListener.call(this, type, listener, options)
  }
  registerEventListeners(uid, [
    {
      name: 20,
      params: ['event.target.id'],
      capture: true,
    },
    {
      name: 21,
      params: ['event.deltaY'],
      passive: true,
    },
  ])
  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Button,
      id: 'capture-target',
      onClick: 20,
      childCount: 1,
    },
    text('capture'),
    {
      type: VirtualDomElements.Div,
      id: 'passive-target',
      onWheel: 21,
      childCount: 1,
    },
    text('passive'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)
  EventTarget.prototype.addEventListener = originalAddEventListener
  return listenerOptions
}

const runListenerLifecycle = () => {
  const $mount = createCaseRoot('listener-lifecycle-case')
  const calls = []
  const eventMap = {
    1() {
      calls.push('click-old')
    },
    2() {
      calls.push('down')
    },
    3() {
      calls.push('click-new')
    },
  }
  let dom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Button,
      id: 'listener-life-target',
      onClick: 1,
      onMouseDown: 2,
      childCount: 1,
    },
    text('button'),
  ]
  renderInto($mount, dom, eventMap)
  const $root = $mount.firstElementChild
  const $button = document.getElementById('listener-life-target')
  $button.click()
  $button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

  dom = patchDom(
    $root,
    dom,
    [
      { type: VirtualDomElements.Div, childCount: 1 },
      {
        type: VirtualDomElements.Button,
        id: 'listener-life-target',
        onMouseDown: 2,
        childCount: 1,
      },
      text('button'),
    ],
    eventMap,
  )
  $button.click()
  $button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

  dom = patchDom(
    $root,
    dom,
    [
      { type: VirtualDomElements.Div, childCount: 1 },
      {
        type: VirtualDomElements.Button,
        id: 'listener-life-target',
        onClick: 3,
        onMouseDown: 2,
        childCount: 1,
      },
      text('button'),
    ],
    eventMap,
  )
  $button.click()
  $button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }))

  return calls
}

window.__virtualDomBroadEventCoverageResult = {
  registeredEventArgs: runRegisteredEventArgs(),
  listenerOptions: runListenerOptions(),
  listenerLifecycle: runListenerLifecycle(),
}
window.__virtualDomDiffTestComplete = true
