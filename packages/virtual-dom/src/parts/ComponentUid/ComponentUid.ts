import { getUidTarget } from '../GetUidTarget/GetUidTarget.ts'
import { uidSymbol } from '../UidSymbol/UidSymbol.ts'

export const setComponentUid = ($Element, uid): void => {
  Object.defineProperty($Element, uidSymbol, {
    configurable: true,
    value: uid,
    writable: true,
  })
}

export const getComponentUid = ($Element): number => {
  const $Target = getUidTarget($Element)
  if (!$Target) {
    return 0
  }
  return Object.getOwnPropertyDescriptor($Target, uidSymbol)?.value
}

export const getComponentUidFromEvent = (event): number => {
  const { currentTarget, target } = event
  return getComponentUid(currentTarget || target)
}
