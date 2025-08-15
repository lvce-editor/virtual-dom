export const queryInputs = ($Viewlet: HTMLElement): readonly any[] => {
  return [...$Viewlet.querySelectorAll('input, textarea, select')]
}
