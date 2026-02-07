export const setStyle = ($Element: HTMLElement, styleString: string): void => {
  if (typeof styleString !== 'string') {
    return
  }
  
  const styleRegex = /([^:]+):\s*([^;]+)/g
  let match
  while ((match = styleRegex.exec(styleString)) !== null) {
    const key = match[1].trim()
    const value = match[2].trim()
    $Element.style[key] = value
  }
}
