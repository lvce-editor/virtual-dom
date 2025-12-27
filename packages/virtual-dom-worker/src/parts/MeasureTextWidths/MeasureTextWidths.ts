import { px } from '@lvce-editor/virtual-dom-worker'
import { createTextMeasureContext } from '../CreateTextMeasureContext/CreateTextMeasureContext.ts'
import * as GetFontString from '../GetFontString/GetFontString.ts'

export const measureTextWidths = (
  texts: readonly string[],
  fontWeight: number,
  fontSize: number,
  fontFamily: string,
  letterSpacing: number,
): readonly number[] => {
  if (typeof letterSpacing !== 'number') {
    throw new TypeError('letterSpacing must be of type number')
  }
  const letterSpacingString = px(letterSpacing)
  const fontString = GetFontString.getFontString(
    fontWeight,
    fontSize,
    fontFamily,
  )
  const ctx = createTextMeasureContext(letterSpacingString, fontString)
  const widths: number[] = []
  for (const text of texts) {
    const metrics = ctx.measureText(text)
    const { width } = metrics
    widths.push(width)
  }
  return widths
}
