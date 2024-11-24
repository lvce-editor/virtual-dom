const pick = (param, event) => {
  if (param.startsWith('event.')) {
    let dotIndex = param.indexOf('.') + 1
    let prop = event
    while (true) {
      const nextDotIndex = param.indexOf('.', dotIndex)
      if (nextDotIndex === -1) {
        break
      }
      const key = param.slice(dotIndex, nextDotIndex - 1)
      prop = event[key]
      dotIndex = nextDotIndex
    }
    return prop
  }
  return param
}

export const getArgs = (params, event) => {
  const result: any[] = []
  for (const param of params) {
    const actual = pick(param, event)
    result.push(actual)
  }
  return result
}
