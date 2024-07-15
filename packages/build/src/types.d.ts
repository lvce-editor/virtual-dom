export const render: (elements: any[], eventMap?: any) => HTMLElement

export const renderInto: (
  $Parent: HTMLElement,
  elements: any[],
  eventMap?: any,
) => void

export const setIpc: (ipc: any) => void

export const setComponentUid: ($Element: HTMLElement, uid: number) => void

export const getComponentUid: ($Element: HTMLElement) => void

export const getComponentUidFromEvent: (event: Event) => void

export const rememberFocus: (
  $Viewlet: HTMLElement,
  dom: any[],
  eventMap: any,
  uid: number,
) => void
