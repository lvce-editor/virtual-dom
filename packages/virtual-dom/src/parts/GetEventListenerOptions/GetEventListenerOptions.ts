export const getEventListenerOptions = (eventName: string, value: any): any => {
  if (value.passive === true || value.passive === false) {
    return {
      passive: value.passive,
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
