export const setDragImage = (
  dataTransfer: DataTransfer,
  label: string,
): void => {
  const dragImage = document.createElement('div')
  dragImage.className = 'DragImage'
  dragImage.textContent = label
  document.body.append(dragImage)
  dataTransfer.setDragImage(dragImage, -10, -10)
  const handleTimeOut = (): void => {
    dragImage.remove()
  }
  setTimeout(handleTimeOut, 0)
}
