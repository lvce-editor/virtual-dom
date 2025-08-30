import type { VirtualDomNode } from '../VirtualDomNode/VirtualDomNode.ts'
import { VirtualDomElements } from '@lvce-editor/constants'

export const text = (data: string): VirtualDomNode => {
  return {
    type: VirtualDomElements.Text,
    text: data,
    childCount: 0,
  }
}
