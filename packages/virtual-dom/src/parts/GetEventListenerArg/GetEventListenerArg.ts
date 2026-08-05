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
  if (item.getAsFileSystemHandle) {
    // @ts-ignore
    const file = await item.getAsFileSystemHandle()
    return {
      file: item.getAsFile(),
      kind: 'file',
      type: item.type,
      value: file,
    }
  }
  const file = item.getAsFile()
  return {
    kind: 'file-legacy',
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

const handleClipboardDataFiles = (event: ClipboardEvent): readonly File[] => {
  if (!event.clipboardData) {
    return []
  }
  const files: File[] = []
  for (const item of event.clipboardData.items) {
    if (item.kind !== 'file') {
      continue
    }
    const file = item.getAsFile()
    if (file) {
      files.push(file)
    }
  }
  return files
}

const handleClipboardDataFiles2 = (
  event: ClipboardEvent,
): readonly number[] => {
  if (!event.clipboardData) {
    return []
  }
  const fileItems = [...event.clipboardData.items].filter(
    (item) => item.kind === 'file',
  )
  const promises = fileItems.map(unwrapItem)
  return promises.map((promise) => FileHandles.add(promise))
}

const getTargetName = (event: any): string => {
  const { target } = event
  if (target.name) {
    return target.name
  }
  const namedTarget =
    target.closest?.('[name]') || target.parentElement?.closest?.('[name]')
  if (
    event.currentTarget?.contains &&
    namedTarget !== event.currentTarget &&
    !event.currentTarget.contains(namedTarget)
  ) {
    return ''
  }
  return namedTarget?.getAttribute?.('name') || namedTarget?.name || ''
}

const getNestedProperty = (value: any, path: string): any => {
  const parts = path.split('.')
  let current = value
  for (const part of parts) {
    if (current === undefined || current === null) {
      return undefined
    }
    current = current[part]
  }
  return current
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
    case 'event.clipboardData.files':
      return handleClipboardDataFiles(event)
    case 'event.clipboardData.files2':
      return handleClipboardDataFiles2(event)
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
    case 'event.target.href':
      return event.target.href
    case 'event.target.name':
      return getTargetName(event)
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
      if (
        typeof param === 'string' &&
        param.startsWith('event.currentTarget.')
      ) {
        const path = param.slice('event.currentTarget.'.length)
        return getNestedProperty(event.currentTarget, path)
      }
      if (typeof param === 'string' && param.startsWith('event.target.')) {
        const path = param.slice('event.target.'.length)
        return getNestedProperty(event.target, path)
      }
      return param
  }
}
