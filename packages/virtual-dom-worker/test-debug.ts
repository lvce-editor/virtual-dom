import { VirtualDomElements } from '@lvce-editor/constants'
import * as VirtualDomTree from './src/parts/VirtualDomTree/VirtualDomTree.ts'

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

console.log('Old tree:')
console.log(JSON.stringify(VirtualDomTree.arrayToTree(initialDom), null, 2))
console.log('\nNew tree:')
console.log(JSON.stringify(VirtualDomTree.arrayToTree(updatedDom), null, 2))
