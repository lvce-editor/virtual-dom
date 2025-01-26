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
    case 'event.data':
      return event.data
    case 'event.deltaMode':
      return event.deltaMode
    case 'event.deltaX':
      return event.deltaX
    case 'event.deltaY':
      return event.deltaY
    default:
      return param
  }
}
