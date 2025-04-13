let ignore = false

export const startIgnore = (): void => {
  ignore = true
}

export const stopIgnore = (): void => {
  ignore = false
}

export const enabled = (): boolean => {
  return ignore
}
