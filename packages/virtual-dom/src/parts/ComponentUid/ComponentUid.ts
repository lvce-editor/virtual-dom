import { getUidTarget } from '../GetUidTarget/GetUidTarget.ts'
import { uidSymbol } from '../UidSymbol/UidSymbol.ts'

export const setComponentUid = ($Element, uid) => {
  $Element[uidSymbol] = uid
}

export const getComponentUid = ($Element) => {
  const $Target = getUidTarget($Element)
  if (!$Target) {
    return 0
  }
  return $Target[uidSymbol]
}

export const getComponentUidFromEvent = (event) => {
  const { target, currentTarget } = event
  return getComponentUid(currentTarget || target)
}
