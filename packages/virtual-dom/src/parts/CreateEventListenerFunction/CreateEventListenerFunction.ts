import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as GetEventListenerArgs from '../GetEventListenerArgs/GetEventListenerArgs.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'

export const createFn = (info) => {
  const fn = (event) => {
    if (info.preventDefault) {
      event.preventDefault(event)
    }
    const uid = ComponentUid.getComponentUidFromEvent(event)
    const args = GetEventListenerArgs.getEventListenerArgs(info.params, event)
    if (args.length === 0) {
      return
    }
    const ipc = IpcState.getIpc()
    ipc.send('Viewlet.executeViewletCommand', uid, ...args)
  }
  NameAnonymousFunction.nameAnonymousFunction(fn, info.name)
  return fn
}
