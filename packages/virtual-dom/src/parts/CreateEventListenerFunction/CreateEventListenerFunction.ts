import * as ComponentUid from '../ComponentUid/ComponentUid.ts'
import * as IpcState from '../IpcState/IpcState.ts'
import * as NameAnonymousFunction from '../NameAnonymousFunction/NameAnonymousFunction.ts'

const getArgs = (params, event) => {
  return [...params]
}

export const createFn = (info) => {
  const fn = (event) => {
    if (info.preventDefault) {
      event.preventDefault(event)
    }
    const uid = ComponentUid.getComponentUidFromEvent(event)
    const args = getArgs(info.params, event)
    if (args.length === 0) {
      return
    }
    const ipc = IpcState.getIpc()
    ipc.send('Viewlet.executeViewletCommand', uid, ...args)
  }
  NameAnonymousFunction.nameAnonymousFunction(fn, info.name)
  return fn
}
