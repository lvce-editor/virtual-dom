import { getUidTarget } from '../GetUidTarget/GetUidTarget.ts'
import { uidSymbol } from '../UidSymbol/UidSymbol.ts'

export const setComponentUid = ($Element, uid): void => {
  $Element[uidSymbol] = uid
}

export const getComponentUid = ($Element): number => {
  const $Target = getUidTarget($Element)
  if (!$Target) {
    return 0
  }
  return $Target[uidSymbol]
}

export const getComponentUidFromEvent = (event): number => {
  const { currentTarget, target } = event
  return getComponentUid(currentTarget || target)
}
