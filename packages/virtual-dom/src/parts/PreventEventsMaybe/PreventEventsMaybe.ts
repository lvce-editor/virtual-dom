import { getComponentUid } from '../ComponentUid/ComponentUid.ts'
import { getDragInfo } from '../DragInfo/DragInfo.ts'
import { isInputElement } from '../IsInputElement/IsInputElement.ts'
import { setDragImage } from '../SetDragImage/SetDragImage.ts'

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
  const { target, dataTransfer } = event
  if (dataTransfer) {
    const uid = getComponentUid(target)
    const dragInfo = getDragInfo(uid)
    if (!dragInfo) {
      return
    }
    for (const item of dragInfo) {
      dataTransfer.setData(item.type, item.data)
    }
    if (dragInfo.label) {
      setDragImage(dataTransfer, dragInfo.label)
    }
  }
}
