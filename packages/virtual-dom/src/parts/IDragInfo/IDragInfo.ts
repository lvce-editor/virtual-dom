export interface DragInfoItem {
  readonly data: string
  readonly type: string
}

export interface IDragInfoNew {
  readonly items: readonly DragInfoItem[]
  readonly label?: string
}

export type IDragInfoOld = readonly DragInfoItem[]

export type IDragInfo = IDragInfoNew | IDragInfoOld
