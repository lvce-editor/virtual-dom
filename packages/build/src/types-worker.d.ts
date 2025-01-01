export interface VirtualDomNode {
  readonly type: number
  readonly [key: string]: any
}

export const text: (data: string) => VirtualDomNode

export const mergeClassNames: (...classNames: readonly string[]) => string
