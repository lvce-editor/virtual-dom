import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as GetListenerArgs from '../GetListenerArgs/GetListenerArgs.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'

const listeners = Object.create(null)

const createFn = (info) => {
  const fn = (event) => {
    if (info.preventDefault) {
      event.preventDefault(event)
    }
    const uid = ComponentUid.getComponentUidFromEvent(event)
    const args = GetListenerArgs.getArgs(info.params, event)
    if (args.length === 0) {
      return
    }
    const ipc = IpcState.getIpc()
    ipc.send('Viewlet.executeViewletCommand', uid, ...args)
  }
  NameAnonymousFunction.nameAnonymousFunction(fn, info.name)
  return fn
}

export const registerEventListeners = (id, eventListeners) => {
  const map = Object.create(null)
  for (const info of eventListeners) {
    const fn = createFn(info)
    map[info.name] = fn
  }
  listeners[id] = map
}

export const getEventListenerMap = (id) => {
  const map = listeners[id]
  return map
}
