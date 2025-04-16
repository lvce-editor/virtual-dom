import * as Id from '../Id/Id.ts'

const state: Record<number, Promise<FileSystemHandle>> = Object.create(null)

export const acquire = (id: number): Promise<FileSystemHandle> => {
  const promise = state[id]
  delete state[id]
  return promise
}

export const getFileHandles = async (
  ids: readonly number[],
): Promise<readonly FileSystemHandle[]> => {
  const promises = ids.map((id) => acquire(id))
  const handles = await Promise.all(promises)
  return handles
}

export const add = (promise: Promise<FileSystemHandle>): number => {
  const id = Id.create()
  state[id] = promise
  return id
}

export const addFileHandle = (fileHandle: FileSystemHandle): number => {
  const promise = Promise.resolve(fileHandle)
  return add(promise)
}
