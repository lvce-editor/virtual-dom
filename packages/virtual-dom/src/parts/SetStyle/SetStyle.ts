const STYLE_REGEX = /([^:;]+):\s*([^;]+)/g
const KEBAB_CASE_REGEX = /-([a-z])/g

export const setStyle = ($Element: HTMLElement, styleString: string): void => {
  if (typeof styleString !== 'string') {
    return
  }

  let match
  while ((match = STYLE_REGEX.exec(styleString)) !== null) {
    const key = match[1].trim()
    const value = match[2].trim()
    // Convert kebab-case to camelCase for CSS properties with dashes
    const camelCaseKey = key.replaceAll(KEBAB_CASE_REGEX, (_, char) =>
      char.toUpperCase(),
    )
    $Element.style[camelCaseKey] = value
  }
}
