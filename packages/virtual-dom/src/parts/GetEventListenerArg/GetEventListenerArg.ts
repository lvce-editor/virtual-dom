import * as FileHandles from '../FileHandles/FileHandles.ts'

const unwrapItemString = async (item: DataTransferItem): Promise<any> => {
  const { resolve, promise } = Promise.withResolvers()
  item.getAsString(resolve)
  const value = await promise
  return {
    kind: 'string',
    type: item.type,
    value,
  }
}

const unwrapItemFile = async (item: DataTransferItem): Promise<any> => {
  // @ts-ignore
  const file = await item.getAsFileSystemHandle()
  return {
    kind: 'file',
    type: item.type,
    value: file,
  }
}

const unknownItem = {
  kind: 'unknown',
  type: '',
  value: '',
}

const unwrapItem = (item: DataTransferItem): any => {
  switch (item.kind) {
    case 'file':
      return unwrapItemFile(item)
    case 'string':
      return unwrapItemString(item)
    default:
      return unknownItem
  }
}

const handleDataTransferFiles = (event: DragEvent): readonly number[] => {
  if (!event.dataTransfer) {
    return []
  }
  const items = [...event.dataTransfer.items]
  const promises = items.map(unwrapItem)
  const ids = promises.map((promise) => FileHandles.add(promise))
  return ids
}

export const getEventListenerArg = (param: string, event: any): any => {
  switch (param) {
    case 'event.altKey':
      return event.altKey
    case 'event.button':
      return event.button
    case 'event.clientX':
      return event.clientX
    case 'event.clientY':
      return event.clientY
    case 'event.ctrlKey':
      return event.ctrlKey
    case 'event.data':
      return event.data
    case 'event.dataTransfer.files':
      return event.dataTransfer.files
    case 'event.dataTransfer.files2':
      return handleDataTransferFiles(event)
    case 'event.defaultPrevented':
      return event.defaultPrevented
    case 'event.deltaMode':
      return event.deltaMode
    case 'event.deltaX':
      return event.deltaX
    case 'event.deltaY':
      return event.deltaY
    case 'event.detail':
      return event.detail
    case 'event.inputType':
      return event.inputType
    case 'event.isTrusted':
      return event.isTrusted
    case 'event.key':
      return event.key
    case 'event.shiftKey':
      return event.shiftKey
    case 'event.target.checked':
      return event.target.checked
    case 'event.target.className':
      return event.target.className
    case 'event.target.dataset.groupId':
      return event.target.dataset.groupId
    case 'event.target.dataset.groupIndex':
      return event.target.dataset.groupIndex
    case 'event.target.dataset.id':
      return event.target.dataset.id
    case 'event.target.dataset.index':
      return event.target.dataset.index
    case 'event.target.dataset.name':
      return event.target.dataset.name
    case 'event.target.href':
      return event.target.href
    case 'event.target.name':
      return event.target.name || ''
    case 'event.target.nodeName':
      return event.target.nodeName
    case 'event.target.scrollTop':
      return event.target.scrollTop
    case 'event.target.selectionEnd':
      return event.target.selectionEnd
    case 'event.target.selectionStart':
      return event.target.selectionStart
    case 'event.target.src':
      return event.target.src
    case 'event.target.value':
      return event.target.value
    case 'event.x':
      return event.x
    case 'event.y':
      return event.y
    default:
      return param
  }
}
