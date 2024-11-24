import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as ListenerCache from '../ListenerCache/ListenerCache.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'

export const getWrappedListener = (listener, returnValue) => {
  if (!returnValue) {
    return listener
  }
  if (!ListenerCache.has(listener)) {
    const wrapped = (event) => {
      const uid = ComponentUid.getComponentUidFromEvent(event)
      const result = listener(event)
      // TODO check for empty array by value
      if (result.length === 0) {
        return
      }
      const ipc = IpcState.getIpc()
      ipc.send('Viewlet.executeViewletCommand', uid, ...result)
    }
    NameAnonymousFunction.nameAnonymousFunction(wrapped, listener.name)
    ListenerCache.set(listener, wrapped)
  }
  return ListenerCache.get(listener)
}
