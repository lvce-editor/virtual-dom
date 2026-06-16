import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as EventState from '../EventState/EventState.ts'
import { getActiveElementInside } from '../GetActiveElementInside/GetActiveElementInside.ts'
import * as QueryInputs from '../QueryInputs/QueryInputs.ts'
import * as RegisterEventListeners from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDom from '../VirtualDom/VirtualDom.ts'

const focusElement = ($Element: HTMLElement): void => {
  $Element.focus({ preventScroll: true })
}

const getInputMap = ($Viewlet: HTMLElement): Record<string, string> => {
  const $$Inputs = QueryInputs.queryInputs($Viewlet)
  const inputMap = Object.create(null)
  for (const $Input of $$Inputs) {
    inputMap[$Input.name] = $Input.value
  }
  return inputMap
}

const createHiddenContainer = (
  activeElement: Element | null | undefined,
  focused: string | null,
): HTMLDivElement => {
  const $Hidden = document.createElement('div')
  $Hidden.style.display = 'none'
  if (focused && activeElement && document.body) {
    document.body.append($Hidden)
    $Hidden.append(activeElement)
  }
  return $Hidden
}

const restoreFocusedElement = (
  $Hidden: HTMLDivElement,
  $New: HTMLElement,
  focused: string,
): void => {
  const $NewFocused = $New.querySelector<HTMLInputElement>(
    `[name="${CSS.escape(focused)}"]`,
  )
  if (!$NewFocused) {
    return
  }
  const $Previous = $Hidden.firstChild as HTMLInputElement | null
  if (!$Previous) {
    return
  }
  $Previous.className = $NewFocused.className
  $Previous.placeholder = $NewFocused.placeholder
  if ($NewFocused.childNodes) {
    $Previous.replaceChildren(...$NewFocused.childNodes)
  }
  $NewFocused.replaceWith($Previous)
}

const renderWithUid = (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid: number,
  inputMap: Record<string, string>,
  focused: string | null,
  $Hidden: HTMLDivElement,
): HTMLElement => {
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
    restoreFocusedElement($Hidden, $New, focused)
  }
  return $New
}

const restoreFocus = (
  $Viewlet: HTMLElement,
  isRootTree: boolean,
  isTreeFocused: boolean,
  focused: string | null,
): void => {
  if (isRootTree) {
    focusElement($Viewlet)
    return
  }
  if (isTreeFocused) {
    const $Tree = $Viewlet.querySelector(':scope [role="tree"]')
    if ($Tree) {
      // @ts-ignore
      focusElement($Tree)
    }
    return
  }
  if (!focused) {
    return
  }
  const $Focused = $Viewlet.querySelector(`[name="${CSS.escape(focused)}"]`)
  if ($Focused) {
    // @ts-ignore
    focusElement($Focused)
  }
}

export const rememberFocus = (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid = 0,
): any => {
  EventState.startIgnore()
  const oldLeft = $Viewlet.style.left
  const oldTop = $Viewlet.style.top
  const oldWidth = $Viewlet.style.width
  const oldHeight = $Viewlet.style.height
  const activeElement = getActiveElementInside($Viewlet)
  const isTreeFocused = activeElement?.getAttribute('role') === 'tree'
  const isRootTree =
    $Viewlet.getAttribute('role') === 'tree' && activeElement === $Viewlet
  const focused = activeElement?.getAttribute('name') || null
  const $Hidden = createHiddenContainer(activeElement, focused)
  const inputMap = getInputMap($Viewlet)
  if (uid) {
    const numericUid = Number(uid)
    $Viewlet = renderWithUid(
      $Viewlet,
      dom,
      eventMap,
      numericUid,
      inputMap,
      focused,
      $Hidden,
    )
    $Hidden.remove()
  } else {
    VirtualDom.renderInto($Viewlet, dom, eventMap)
    $Hidden.remove()
  }

  restoreFocus($Viewlet, isRootTree, isTreeFocused, focused)

  $Viewlet.style.top = oldTop
  $Viewlet.style.left = oldLeft
  $Viewlet.style.height = oldHeight
  $Viewlet.style.width = oldWidth

  EventState.stopIgnore()

  return $Viewlet
}
