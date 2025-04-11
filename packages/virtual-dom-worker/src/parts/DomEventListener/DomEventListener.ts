export interface DomEventListener {
  readonly name: string
  readonly params: readonly string[]
  readonly preventDefault?: boolean
  readonly passive?: boolean
}
