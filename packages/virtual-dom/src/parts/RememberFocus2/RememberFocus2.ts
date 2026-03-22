import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as RegisterEventListeners from '../RegisterEventListeners/RegisterEventListeners.ts'
import * as VirtualDom from '../VirtualDom/VirtualDom.ts'

export const rememberFocus2 = (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid = 0,
): any => {
  if (uid) {
    const newEventMap = RegisterEventListeners.getEventListenerMap(uid)
    const $New = VirtualDom.render(dom, eventMap, newEventMap)
      .firstChild as HTMLElement
    ComponentUid.setComponentUid($New, uid)

    $Viewlet.replaceWith($New)

    $Viewlet = $New
  } else {
    VirtualDom.renderInto($Viewlet, dom, eventMap)
  }
  return $Viewlet
}
