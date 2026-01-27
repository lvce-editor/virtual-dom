const instances = Object.create(null)

export const get = (viewletId: string | number): any => {
  return instances[viewletId]
}

export const set = (viewletId: string | number, instance: any): void => {
  instances[viewletId] = instance
}
