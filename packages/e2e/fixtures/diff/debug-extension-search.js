// Simplified version of the extension search test
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'
import { VirtualDomElements } from '@lvce-editor/constants'

// Simplified initial DOM - a root with a header and a list
const initialDom = [
  {
    type: VirtualDomElements.Div,
    className: 'root',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Div,
    className: 'header',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Header',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    className: 'listContainer',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Div,
    className: 'item1',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 1',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    className: 'item2',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Item 2',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    className: 'scrollbar',
    childCount: 0,
  },
]

// Updated DOM - same header but the list is completely replaced
const updatedDom = [
  {
    type: VirtualDomElements.Div,
    className: 'root',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Div,
    className: 'header',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Header',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Div,
    className: 'message',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'No items found',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
console.log(JSON.stringify(patches, null, 2))
