import { applyDragInfoMaybe } from '../ApplyDragInfoMaybe/ApplyDragInfoMaybe.ts'
import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as EventState from '../EventState/EventState.ts'
import * as GetEventListenerArgs from '../GetEventListenerArgs/GetEventListenerArgs.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'
import { preventEventsMaybe } from '../PreventEventsMaybe/PreventEventsMaybe.ts'

export const createFn = (info): any => {
  const fn = (event): void => {
    if (EventState.enabled()) {
      return
    }
    const uid = ComponentUid.getComponentUidFromEvent(event)
    const args = GetEventListenerArgs.getEventListenerArgs(info.params, event)
    preventEventsMaybe(info, event)
    applyDragInfoMaybe(event)
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
