const createIdGenerator = (): (() => number) => {
  let id = 0

  return (): number => {
    return ++id
  }
}

export const create = createIdGenerator()
