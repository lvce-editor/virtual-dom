const KEBAB_CASE_REGEX = /-([a-z])/g

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
    // Convert kebab-case to camelCase for CSS properties with dashes
    const camelCaseKey = key.replaceAll(KEBAB_CASE_REGEX, (_, char) =>
      char.toUpperCase(),
    )
    $Element.style[camelCaseKey] = value
  }
}
