const cache = new Map()

export const has = (listener): boolean => {
  return cache.has(listener)
}

export const set = (listener, value): void => {
  cache.set(listener, value)
}

export const get = (listener): any => {
  return cache.get(listener)
}
