const isInputElement = (element: HTMLElement): boolean => {
  return element instanceof HTMLInputElement
}

export const preventEventsMaybe = (info: any, event: any): void => {
  if (info.preventDefault === 2) {
    if (!isInputElement(event.target)) {
      event.preventDefault()
    }
  } else if (info.preventDefault) {
    event.preventDefault()
  }
  if (info.stopPropagation) {
    event.stopPropagation()
  }
  if (event.dataTransfer) {
    if (info.dragInfo) {
      for (const item of info.dragInfo) {
        event.dataTransfer.setData(item.type, item.data)
      }
    }
    if (info.dragEffect) {
      event.dataTransfer.effectAllowed = info.dragEffect
    }
  }
}
