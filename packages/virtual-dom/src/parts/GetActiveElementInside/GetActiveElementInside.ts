export const getActiveElementInside = (
  $Viewlet: HTMLElement | undefined,
): HTMLElement | undefined => {
  if (!$Viewlet) {
    return undefined
  }
  const $ActiveElement = document.activeElement as HTMLElement
  if (!$ActiveElement) {
    return undefined
  }
  if (!$Viewlet.contains($ActiveElement)) {
    return undefined
  }
  return $ActiveElement
}
