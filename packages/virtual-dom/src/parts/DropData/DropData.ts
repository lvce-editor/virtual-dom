import * as Id from '../Id/Id.ts'

export interface RetainedDropStringItem {
  readonly index: number
  readonly kind: 'string'
  readonly type: string
  readonly value: Promise<string>
}

export interface RetainedDropFileItem {
  readonly file: File | null
  readonly fileSystemHandle: Promise<FileSystemHandle | undefined>
  readonly index: number
  readonly kind: 'file'
  readonly type: string
}

export type RetainedDropItem = RetainedDropFileItem | RetainedDropStringItem

const state: Record<number, readonly RetainedDropItem[]> = Object.create(null)

const retainString = (
  item: DataTransferItem,
  index: number,
): RetainedDropStringItem => {
  const value = new Promise<string>((resolve) => {
    item.getAsString(resolve)
  })
  return {
    index,
    kind: 'string',
    type: item.type,
    value,
  }
}

const retainFileSystemHandle = async (
  item: DataTransferItem,
): Promise<FileSystemHandle | undefined> => {
  // getAsFileSystemHandle must be invoked while the drag data store is readable.
  const { getAsFileSystemHandle } = item as any
  if (typeof getAsFileSystemHandle !== 'function') {
    return undefined
  }
  try {
    return await getAsFileSystemHandle.call(item)
  } catch {
    return undefined
  }
}

const retainFile = (
  item: DataTransferItem,
  index: number,
): RetainedDropFileItem => {
  return {
    file: item.getAsFile(),
    fileSystemHandle: retainFileSystemHandle(item),
    index,
    kind: 'file',
    type: item.type,
  }
}

const retainItems = (
  dataTransfer: DataTransfer | null,
): readonly RetainedDropItem[] => {
  if (!dataTransfer) {
    return []
  }
  const items: RetainedDropItem[] = []
  for (const [index, item] of [...dataTransfer.items].entries()) {
    if (item.kind === 'string') {
      items.push(retainString(item, index))
    } else if (item.kind === 'file') {
      items.push(retainFile(item, index))
    }
  }
  return items
}

export const add = (dataTransfer: DataTransfer | null): number => {
  const id = Id.create()
  state[id] = retainItems(dataTransfer)
  return id
}

export const acquire = (id: number): readonly RetainedDropItem[] => {
  const items = state[id]
  if (!items) {
    throw new Error(`Drop data not found: ${id}`)
  }
  delete state[id]
  return items
}
