export const getEventListenerOptions = (eventName: string, value: any) => {
  if (value.passive) {
    return {
      passive: true,
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
