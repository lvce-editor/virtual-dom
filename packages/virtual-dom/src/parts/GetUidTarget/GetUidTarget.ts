import { uidSymbol } from '../UidSymbol/UidSymbol.ts'

export const getUidTarget = (
  $Element: HTMLElement,
): HTMLElement | undefined => {
  while ($Element) {
    if (Object.getOwnPropertyDescriptor($Element, uidSymbol)?.value) {
      return $Element
    }
    $Element = $Element.parentNode as HTMLElement
  }
  return undefined
}
