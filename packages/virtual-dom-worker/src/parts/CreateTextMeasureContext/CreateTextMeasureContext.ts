export const createTextMeasureContext = (
  letterSpacing: string,
  font: string,
): OffscreenCanvasRenderingContext2D => {
  const canvas = new OffscreenCanvas(0, 0)
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to get canvas context 2d')
  }
  ctx.letterSpacing = letterSpacing
  ctx.font = font
  return ctx
}
