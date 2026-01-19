export interface DomEventListener {
  readonly name: string | number
  readonly params: readonly (string | number)[]
  readonly passive?: boolean
  readonly preventDefault?: boolean
}
