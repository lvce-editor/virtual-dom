import { VirtualDomElements } from '@lvce-editor/constants'
import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'

export const text = (data: string): VirtualDomNode => {
  return {
    childCount: 0,
    text: data,
    type: VirtualDomElements.Text,
  }
}
