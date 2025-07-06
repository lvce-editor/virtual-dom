import { getComponentUid } from '../ComponentUid/ComponentUid.ts'
import { getDragInfo } from '../DragInfo/DragInfo.ts'
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
  if (event.dataTransfer) {
    const uid = getComponentUid(event.target)
    const dragInfo = getDragInfo(uid)
    if (!dragInfo) {
      return
    }
    for (const item of info.dragInfo) {
      event.dataTransfer.setData(item.type, item.data)
    }
  }
}
