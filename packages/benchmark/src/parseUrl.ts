export const parseUrl = (url: string, base: string): URL => {
  if (!URL.canParse(url, base)) {
    throw new TypeError(`Invalid URL: ${url} with base ${base}`)
  }
  return new URL(url, base)
}
