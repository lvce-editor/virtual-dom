const isInputElement = (element: HTMLElement): boolean => {
  return element instanceof HTMLInputElement
}

const getDragTargetIndex = (target: HTMLElement): number => {
  if (target.dataset.index) {
    return Number.parseInt(target.dataset.index)
  }
  const parentNode = target.closest('[data-index]')
  if (!parentNode) {
    return -1
  }
  // @ts-ignore
  return Number.parseInt(parentNode.dataset.index)
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
    const index = getDragTargetIndex(event.target)
    if (info.dragInfo) {
      for (const item of info.dragInfo) {
        event.dataTransfer.setData(item.type, item.data + index)
      }
    }
    if (info.dragEffect) {
      event.dataTransfer.effectAllowed = info.dragEffect
    }
  }
}
