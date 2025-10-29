export interface DomEventListener {
  readonly name: string | number
  readonly params: readonly (string | number)[]
  readonly preventDefault?: boolean
  readonly passive?: boolean
}
