import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diff } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Label,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Label',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Label,
    for: 'input-field',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Username',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Input,
    id: 'input-field',
    inputType: 'text',
    placeholder: 'Enter username',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
