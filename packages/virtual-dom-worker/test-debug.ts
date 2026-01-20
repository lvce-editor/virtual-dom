import { VirtualDomElements } from '@lvce-editor/constants'
import { diffTree } from './src/parts/VirtualDomDiffTree/VirtualDomDiffTree.ts'

const initialDom = [
  { type: VirtualDomElements.Div, childCount: 1 },
  { type: VirtualDomElements.Span, childCount: 1 },
  { type: VirtualDomElements.Text, text: 'First', childCount: 0 },
]

const updatedDom = [
  { type: VirtualDomElements.Div, childCount: 2 },
  { type: VirtualDomElements.Span, childCount: 1 },
  { type: VirtualDomElements.Text, text: 'First', childCount: 0 },
  { type: VirtualDomElements.Span, childCount: 1 },
  { type: VirtualDomElements.Text, text: 'Second', childCount: 0 },
]

const patches = diffTree(initialDom, updatedDom)
console.log('Patches:', JSON.stringify(patches, null, 2))

// Decode patch types for readability
const patchTypeNames: Record<number, string> = {
  1: 'SetText',
  2: 'Replace',
  3: 'SetAttribute',
  4: 'RemoveAttribute',
  5: 'Remove',
  6: 'Add',
  7: 'NavigateChild',
  8: 'NavigateParent',
  9: 'RemoveChild',
  10: 'NavigateSibling',
}

console.log('\nReadable patches:')
for (const patch of patches) {
  console.log(patchTypeNames[patch.type] || patch.type, patch)
}
