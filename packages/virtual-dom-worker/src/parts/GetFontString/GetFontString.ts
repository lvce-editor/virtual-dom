export const getFontString = (
  fontWeight: number,
  fontSize: number,
  fontFamily: string,
): string => {
  return `${fontWeight} ${fontSize}px ${fontFamily}`
}
