import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const oldNodes = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    childCount: 0,
    text: 'a',
  },
]

const newNodes = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Text,
    childCount: 0,
    text: 'a',
  },
  {
    type: VirtualDomElements.Text,
    childCount: 0,
    text: 'b',
  },
]

renderInto($container, oldNodes)

const patches = diff(oldNodes, newNodes)
applyPatch($container, patches)

window.__virtualDomDiffTestComplete = true
