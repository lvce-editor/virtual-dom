import * as FileHandles from '../FileHandles/FileHandles.ts'

const handleDataTransferFiles = (event: any): readonly number[] => {
  const items = [...event.dataTransfer.items]
  const promises = items.map((item) => item.getAsFileSystemHandle())
  const ids = promises.map((promise) => FileHandles.add(promise))
  return ids
}

export const getEventListenerArg = (param: string, event: any): any => {
  switch (param) {
    case 'event.dataTransfer.files2':
      return handleDataTransferFiles(event)
    case 'event.clientX':
      return event.clientX
    case 'event.x':
      return event.x
    case 'event.clientY':
      return event.clientY
    case 'event.y':
      return event.y
    case 'event.button':
      return event.button
    case 'event.target.value':
      return event.target.value
    case 'event.isTrusted':
      return event.isTrusted
    case 'event.dataTransfer.files':
      return event.dataTransfer.files
    case 'event.target.className':
      return event.target.className
    case 'event.data':
      return event.data
    case 'event.deltaMode':
      return event.deltaMode
    case 'event.deltaX':
      return event.deltaX
    case 'event.deltaY':
      return event.deltaY
    case 'event.target.scrollTop':
      return event.target.scrollTop
    case 'event.detail':
      return event.detail
    case 'event.target.name':
      return event.target.name || ''
    case 'event.target.href':
      return event.target.href
    case 'event.target.src':
      return event.target.src
    case 'event.altKey':
      return event.altKey
    case 'event.key':
      return event.key
    case 'event.ctrlKey':
      return event.ctrlKey
    case 'event.shiftKey':
      return event.shiftKey
    case 'event.inputType':
      return event.inputType
    case 'event.defaultPrevented':
      return event.defaultPrevented
    case 'event.target.dataset.name':
      return event.target.dataset.name
    case 'event.target.dataset.index':
      return event.target.dataset.index
    case 'event.target.nodeName':
      return event.target.nodeName
    case 'event.target.selectionStart':
      return event.target.selectionStart
    case 'event.target.selectionEnd':
      return event.target.selectionEnd
    default:
      return param
  }
}
