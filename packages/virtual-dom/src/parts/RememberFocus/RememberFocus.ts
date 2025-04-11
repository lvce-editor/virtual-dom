import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as QueryInputs from '../QueryInputs/QueryInputs.ts'
import * as RegisterEventListeners from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDom from '../VirtualDom/VirtualDom.ts'

export const rememberFocus = (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid = 0,
): any => {
  const oldLeft = $Viewlet.style.left
  const oldTop = $Viewlet.style.top
  const oldWidth = $Viewlet.style.width
  const oldHeight = $Viewlet.style.height
  const { activeElement } = document
  const isTreeFocused = activeElement?.getAttribute('role') === 'tree'
  const isRootTree =
    $Viewlet.getAttribute('role') === 'tree' && activeElement === $Viewlet
  const focused = activeElement?.getAttribute('name')
  const $Hidden = document.createElement('div')
  $Hidden.style.display = 'none'
  if (focused) {
    if (document.body) {
      document.body.append($Hidden)
    }
    // @ts-ignore
    $Hidden.append(activeElement)
  }
  const $$Inputs = QueryInputs.queryInputs($Viewlet)
  const inputMap = Object.create(null)
  for (const $Input of $$Inputs) {
    inputMap[$Input.name] = $Input.value
  }
  if (uid) {
    const newEventMap = RegisterEventListeners.getEventListenerMap(uid)
    const $New = VirtualDom.render(dom, eventMap, newEventMap)
      .firstChild as HTMLElement
    ComponentUid.setComponentUid($New, uid)
    const $$NewInputs = QueryInputs.queryInputs($New)
    for (const $Input of $$NewInputs) {
      $Input.value = inputMap[$Input.name] || $Input.value || ''
    }
    $Viewlet.replaceWith($New)
    if (focused) {
      const $NewFocused = $Viewlet.querySelector(`[name="${focused}"]`)
      if ($NewFocused) {
        $NewFocused.replaceWith($Hidden.firstChild as HTMLElement)
      }
    }
    $Hidden.remove()
    $Viewlet = $New
  } else {
    VirtualDom.renderInto($Viewlet, dom, eventMap)
  }

  if (isRootTree) {
    $Viewlet.focus()
  } else if (isTreeFocused) {
    const $Tree = $Viewlet.querySelector('[role="tree"]')
    if ($Tree) {
      // @ts-ignore
      $Tree.focus()
    }
  } else if (focused) {
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
