import { uidSymbol } from '../UidSymbol/UidSymbol.ts'


export const getUidTarget = ($Element) => {
  while ($Element) {
    if ($Element[uidSymbol]) {
      return $Element
    }
    $Element = $Element.parentNode
  }
  return undefined
}
