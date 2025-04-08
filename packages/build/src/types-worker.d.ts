export interface VirtualDomNode {
  readonly type: number
  readonly [key: string]: any
}

export const text: (data: string) => VirtualDomNode

export const mergeClassNames: (...classNames: readonly string[]) => string

export interface Patch {}

export const diff: (
  oldNodes: readonly VirtualDomNode[],
  newNodes: readonly VirtualDomNode[],
) => readonly Patch[]

export interface DomEventListener {
  readonly name: string
  readonly params: readonly string[]
  readonly preventDefault?: boolean
  readonly passive?: boolean
}

export interface VirtualDomElements {
  readonly [key: number]: number
}
