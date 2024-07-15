const uidSymbol = Symbol('uid')

export const setComponentUid = ($Element, uid) => {
  $Element[uidSymbol] = uid
}

const getUidTarget = ($Element) => {
  while ($Element) {
    if ($Element[uidSymbol]) {
      return $Element
    }
    $Element = $Element.parentNode
  }
  return undefined
}

export const getComponentUid = ($Element) => {
  const $Target = getUidTarget($Element)
  return $Target[uidSymbol]
}

export const getComponentUidFromEvent = (event) => {
  const { target, currentTarget } = event
  return getComponentUid(currentTarget || target)
}
