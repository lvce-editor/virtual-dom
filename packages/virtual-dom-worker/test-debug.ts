import { VirtualDomElements } from '@lvce-editor/constants'
import { diffTree } from './src/parts/VirtualDomDiffTree/VirtualDomDiffTree.ts'

const patchTypeNames: Record<number, string> = {
  1: 'SetText', 2: 'Replace', 3: 'SetAttribute', 4: 'RemoveAttribute',
  5: 'Remove', 6: 'Add', 7: 'NavigateChild', 8: 'NavigateParent',
  9: 'RemoveChild', 10: 'NavigateSibling',
}

// node-type-change: Div > Text -> Span > Text
console.log('=== node-type-change ===')
const dom1 = [
  { type: VirtualDomElements.Div, childCount: 1 },
  { type: VirtualDomElements.Text, text: 'Hello', childCount: 0 },
]
const dom2 = [
  { type: VirtualDomElements.Span, childCount: 1 },
  { type: VirtualDomElements.Text, text: 'Hello', childCount: 0 },
]
const patches = diffTree(dom1, dom2)
console.log('Patches:')
for (const patch of patches) {
  console.log('  ', patchTypeNames[patch.type] || patch.type, JSON.stringify(patch))
}
