import { getComponentUid } from '../ComponentUid/ComponentUid.ts'
import { getDragInfo, isDragInfoOld } from '../DragInfo/DragInfo.ts'
import { setDragImage } from '../SetDragImage/SetDragImage.ts'

export const applyDragInfoMaybe = (event: DragEvent): void => {
  const { dataTransfer, target } = event
  if (dataTransfer) {
    const uid = getComponentUid(target)
    const dragInfo = getDragInfo(uid)
    if (!dragInfo) {
      return
    }
    if (isDragInfoOld(dragInfo)) {
      for (const item of dragInfo) {
        dataTransfer.setData(item.type, item.data)
      }
    } else {
      for (const item of dragInfo.items) {
        dataTransfer.items.add(item.data, item.data)
      }
      if (dragInfo.label) {
        setDragImage(dataTransfer, dragInfo.label)
      }
    }
  }
}
