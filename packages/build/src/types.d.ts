export const render: (elements: any[], eventMap?: any) => HTMLElement

export const renderInto: (
  $Parent: HTMLElement,
  elements: any[],
  eventMap?: any,
) => void

export const setIpc: (ipc: any) => void

export const setComponentUid: ($Element: HTMLElement, uid: number) => void

export const getComponentUid: ($Element: HTMLElement) => number

export const getComponentUidFromEvent: (event: Event) => number

export const rememberFocus: (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid: number,
) => void

export const registerEventListeners: any

export const applyPatch: (
  $Element: HTMLElement,
  patches: readonly any[],
) => void

export const getFileHandles: (
  ids: readonly number[],
) => Promise<readonly FileSystemHandle[]>

export const addFileHandle: (fileHandle: FileSystemHandle) => number
