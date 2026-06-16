export const queryInputs = ($Viewlet: HTMLElement): readonly any[] => {
  return [...$Viewlet.querySelectorAll(':scope input, :scope textarea, :scope select')]
}
