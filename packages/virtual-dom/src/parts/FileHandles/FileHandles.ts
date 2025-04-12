import * as Id from '../Id/Id.ts'

const state: Record<number, Promise<FileSystemHandle>> = Object.create(null)

export const get = (id: number): Promise<FileSystemHandle> => {
  return state[id]
}

export const getFileHandles = async (
  ids: readonly number[],
): Promise<readonly FileSystemHandle[]> => {
  const promises = ids.map((id) => get(id))
  const handles = await Promise.all(promises)
  return handles
}

export const add = (promise: Promise<FileSystemHandle>): number => {
  const id = Id.create()
  state[id] = promise
  return id
}
