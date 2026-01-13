import { getComponentUid } from '../ComponentUid/ComponentUid.ts'
import { getDragInfo } from '../DragInfo/DragInfo.ts'
import { setDragImage } from '../SetDragImage/SetDragImage.ts'

export const applyDragInfoMaybe = (event: any): void => {
  const { dataTransfer, target } = event
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
