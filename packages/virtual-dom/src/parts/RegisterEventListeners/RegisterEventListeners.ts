import * as CreateEventListenerFunction from '../CreateEventListenerFunction/CreateEventListenerFunction.ts'

const listeners = Object.create(null)

export const registerEventListeners = (id, eventListeners) => {
  const map = Object.create(null)
  for (const info of eventListeners) {
    const fn = CreateEventListenerFunction.createFn(info)
    map[info.name] = fn
  }
  listeners[id] = map
}

export const getEventListenerMap = (id) => {
  const map = listeners[id]
  return map
}
