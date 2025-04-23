export const preventEventsMaybe = (info, event) => {
  if (info.preventDefault) {
    event.preventDefault()
  }
  if (info.stopPropagation) {
    event.stopPropagation()
  }
}
