export const getEventListenerArg = (param: string, event: any): any => {
  switch (param) {
    case 'event.clientX':
      return event.clientX
    case 'event.clientY':
      return event.clientY
    case 'event.button':
      return event.button
    case 'event.target.value':
      return event.target.value
    default:
      return param
  }
}
