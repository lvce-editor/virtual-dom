export const nameAnonymousFunction = (fn: any, name: string): void => {
  Object.defineProperty(fn, 'name', {
    value: name,
  })
}
