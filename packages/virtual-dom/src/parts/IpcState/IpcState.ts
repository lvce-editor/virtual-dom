const state = {
  ipc: undefined,
}

export const getIpc = (): any => {
  return state.ipc
}

export const setIpc = (value: any) => {
  state.ipc = value
}
