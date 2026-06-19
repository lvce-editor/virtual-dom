const toCamelCase = (key: string): string => {
  let camelCaseKey = ''
  let shouldUpperCase = false
  for (const char of key) {
    if (char === '-') {
      shouldUpperCase = true
      continue
    }
    camelCaseKey += shouldUpperCase ? char.toUpperCase() : char
    shouldUpperCase = false
  }
  return camelCaseKey
}

export const setStyle = ($Element: HTMLElement, styleString: string): void => {
  if (typeof styleString !== 'string') {
    return
  }

  for (const declaration of styleString.split(';')) {
    const colonIndex = declaration.indexOf(':')
    if (colonIndex === -1) {
      continue
    }
    const key = declaration.slice(0, colonIndex).trim()
    const value = declaration.slice(colonIndex + 1).trim()
    if (!key || !value) {
      continue
    }
    if (key.startsWith('--')) {
      $Element.style.setProperty(key, value)
      continue
    }
    const camelCaseKey = toCamelCase(key)
    $Element.style[camelCaseKey] = value
  }
}
