export interface AttributePatch {
  type: 'setAttribute'
  index: number
  key: string
  value: any
}
