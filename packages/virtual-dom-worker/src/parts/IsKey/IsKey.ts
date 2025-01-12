export const isKey = (key: string): boolean => {
  return key !== 'type' && key !== 'childCount'
}
