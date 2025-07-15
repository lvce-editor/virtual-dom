import { applyDragInfoMaybe } from '../ApplyDragInfoMaybe/ApplyDragInfoMaybe.ts'
import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as DomEventType from '../DomEventType/DomEventType.ts'
import * as EventState from '../EventState/EventState.ts'
import * as GetEventListenerArgs from '../GetEventListenerArgs/GetEventListenerArgs.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'
import { preventEventsMaybe } from '../PreventEventsMaybe/PreventEventsMaybe.ts'

const applyPointerTrackMaybe = (info, map, event): void => {
  const { trackPointerEvents } = info
  if (!trackPointerEvents) {
    return
  }
  const { target, pointerId } = event
  target.setPointerCapture(pointerId)
  const [pointerMoveKey, pointerUpKey] = trackPointerEvents
  target.addEventListener(DomEventType.PointerMove, map[pointerMoveKey])
  // TODO use pointerlost event instead
  target.addEventListener(DomEventType.PointerUp, map[pointerUpKey])
}

export const createFn = (info, map): any => {
  const fn = (event): void => {
    if (EventState.enabled()) {
      return
    }
    const uid = ComponentUid.getComponentUidFromEvent(event)
    const args = GetEventListenerArgs.getEventListenerArgs(info.params, event)
    preventEventsMaybe(info, event)
    applyDragInfoMaybe(event)
    applyPointerTrackMaybe(info, map, event)
    if (args.length === 0) {
      return
    }
    const ipc = IpcState.getIpc()
    ipc.send('Viewlet.executeViewletCommand', uid, ...args)
  }
  NameAnonymousFunction.nameAnonymousFunction(fn, info.name)
  if (info.passive) {
    // TODO avoid mutating function property, maybe return an object with function and options
    fn.passive = true
  }
  return fn
}
