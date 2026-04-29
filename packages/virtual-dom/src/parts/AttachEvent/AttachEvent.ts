import * as GetEventListenerOptions from '../GetEventListenerOptions/GetEventListenerOptions.ts'
import * as GetWrappedListener from '../GetWrappedListener/GetWrappedListener.ts'

const attachedListeners = new WeakMap<
  HTMLElement,
  Map<string, { listener: EventListener; options: any }>
>()

const getOptions = (fn: any): any => {
  if (fn.passive) {
    return {
      passive: true,
    }
  }
  if (fn.capture) {
    return {
      capture: true,
    }
  }
  return undefined
}

export const attachEvent = (
  $Node: HTMLElement,
  eventMap: any,
  key: string,
  value: string,
  newEventMap?: any,
): void => {
  const keyLower = key.toLowerCase()
  const listenersByEvent = attachedListeners.get($Node) || new Map()
  const previous = listenersByEvent.get(keyLower)
  if (previous) {
    $Node.removeEventListener(keyLower, previous.listener, previous.options)
  }
  if (newEventMap && newEventMap[value]) {
    const fn = newEventMap[value]
    const options: any = getOptions(fn)
    // TODO support event listener options
    $Node.addEventListener(keyLower, newEventMap[value], options)
    listenersByEvent.set(keyLower, { listener: newEventMap[value], options })
    attachedListeners.set($Node, listenersByEvent)
    return
  }
  const listener = eventMap[value]
  if (!listener) {
    console.warn('listener not found', value)
    return
  }
  const options = GetEventListenerOptions.getEventListenerOptions(key, value)
  const wrapped = GetWrappedListener.getWrappedListener(
    listener,
    eventMap.returnValue,
  )
  $Node.addEventListener(keyLower, wrapped, options)
  listenersByEvent.set(keyLower, { listener: wrapped, options })
  attachedListeners.set($Node, listenersByEvent)
}
