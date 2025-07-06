const dragInfos = Object.create(null)

export const setDragInfo = (id: string | number, data: any): void => {
  dragInfos[id] = data
}

export const getDragInfo = (id: string | number): any => {
  return dragInfos[id]
}

export const removeDragInfo = (id: string | number): void => {
  delete dragInfos[id]
}
