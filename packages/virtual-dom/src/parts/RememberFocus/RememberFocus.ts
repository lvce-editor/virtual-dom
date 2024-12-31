import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as RegisterEventListeners from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDom from '../VirtualDom/VirtualDom.ts'

const queryInputs = ($Viewlet: HTMLElement) => {
  return [...$Viewlet.querySelectorAll('input, textarea')]
}

export const rememberFocus = (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid = 0,
) => {
  // TODO replace this workaround with
  // virtual dom diffing
  const oldLeft = $Viewlet.style.left
  const oldTop = $Viewlet.style.top
  const oldWidth = $Viewlet.style.width
  const oldHeight = $Viewlet.style.height
  // @ts-expect-error
  const focused = document.activeElement.getAttribute('name')
  const $$Inputs = queryInputs($Viewlet)
  const inputMap = Object.create(null)
  for (const $Input of $$Inputs) {
    // @ts-ignore
    inputMap[$Input.name] = $Input.value
  }
  if (uid) {
    const newEventMap = RegisterEventListeners.getEventListenerMap(uid)
    const $New = VirtualDom.render(dom, eventMap, newEventMap).firstChild
    ComponentUid.setComponentUid($New, uid)
    // @ts-ignore
    $Viewlet.replaceWith($New)
    // @ts-ignore
    $Viewlet = $New
  } else {
    VirtualDom.renderInto($Viewlet, dom, eventMap)
  }
  const $$NewInputs = queryInputs($Viewlet)
  for (const $Input of $$NewInputs) {
    // @ts-ignore
    $Input.value = inputMap[$Input.name] || $Input.value || ''
  }
  if (focused) {
    const $Focused = $Viewlet.querySelector(`[name="${focused}"]`)
    if ($Focused) {
      // @ts-ignore
      $Focused.focus()
    }
  }

  $Viewlet.style.top = oldTop
  $Viewlet.style.left = oldLeft
  $Viewlet.style.height = oldHeight
  $Viewlet.style.width = oldWidth

  return $Viewlet
}
