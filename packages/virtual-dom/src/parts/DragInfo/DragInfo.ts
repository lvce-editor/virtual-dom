import type { IDragInfo, IDragInfoOld } from '../IDragInfo/IDragInfo.ts'

const dragInfos = Object.create(null)

export const setDragInfo = (id: string | number, data: IDragInfo): void => {
  dragInfos[id] = data
}

export const getDragInfo = (id: string | number): IDragInfo => {
  return dragInfos[id]
}

export const removeDragInfo = (id: string | number): void => {
  delete dragInfos[id]
}

export const isDragInfoOld = (data: IDragInfo): data is IDragInfoOld => {
  return Array.isArray(data)
}
