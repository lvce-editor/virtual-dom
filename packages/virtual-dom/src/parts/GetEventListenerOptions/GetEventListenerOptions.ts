export const getEventListenerOptions = (eventName: string, value: any): any => {
  if (value.passive) {
    return {
      passive: true,
    }
  }
  if (value.capture) {
    return {
      capture: true,
    }
  }
  switch (eventName) {
    case 'wheel':
      return {
        passive: true,
      }
    default:
      return undefined
  }
}
