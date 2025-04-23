export const preventEventsMaybe = (info: any, event: any): void => {
  if (info.preventDefault) {
    event.preventDefault()
  }
  if (info.stopPropagation) {
    event.stopPropagation()
  }
}
