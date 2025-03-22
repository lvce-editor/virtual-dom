export const getEventListenerArg = (param: string, event: any): any => {
  switch (param) {
    case 'event.clientX':
      return event.clientX
    case 'event.x':
      return event.x
    case 'event.clientY':
      return event.clientY
    case 'event.y':
      return event.y
    case 'event.button':
      return event.button
    case 'event.target.value':
      return event.target.value
    case 'event.isTrusted':
      return event.isTrusted
    case 'event.target.className':
      return event.target.className
    case 'event.data':
      return event.data
    case 'event.deltaMode':
      return event.deltaMode
    case 'event.deltaX':
      return event.deltaX
    case 'event.deltaY':
      return event.deltaY
    case 'event.detail':
      return event.detail
    case 'event.target.name':
      return event.target.name
    case 'event.target.href':
      return event.target.href
    case 'event.target.src':
      return event.target.src
    case 'event.altKey':
      return event.altKey
    case 'event.key':
      return event.key
    case 'event.ctrlKey':
      return event.ctrlKey
    case 'event.shiftKey':
      return event.shiftKey
    case 'event.inputType':
      return event.inputType
    default:
      return param
  }
}
