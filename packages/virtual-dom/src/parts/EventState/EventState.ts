const state = {
  ignore: false,
}

export const startIgnore = (): void => {
  state.ignore = true
}

export const stopIgnore = (): void => {
  state.ignore = false
}

export const enabled = (): boolean => {
  return state.ignore
}
