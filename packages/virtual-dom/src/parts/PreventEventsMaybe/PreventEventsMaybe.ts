import { isInputElement } from '../IsInputElement/IsInputElement.ts'

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
}
