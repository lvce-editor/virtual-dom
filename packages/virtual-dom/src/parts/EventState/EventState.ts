const createEventState = (): {
  readonly startIgnore: () => void
  readonly stopIgnore: () => void
  readonly enabled: () => boolean
} => {
  let ignore = false

  return {
    startIgnore(): void {
      ignore = true
    },
    stopIgnore(): void {
      ignore = false
    },
    enabled(): boolean {
      return ignore
    },
  }
}

const eventState = createEventState()

export const startIgnore = (): void => {
  eventState.startIgnore()
}

export const stopIgnore = (): void => {
  eventState.stopIgnore()
}

export const enabled = (): boolean => {
  return eventState.enabled()
}
