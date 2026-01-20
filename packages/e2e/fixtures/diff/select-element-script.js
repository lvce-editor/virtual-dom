import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Select,
    childCount: 0,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Select,
    id: 'country-select',
    className: 'form-select',
    childCount: 3,
  },
  {
    type: VirtualDomElements.Option,
    value: 'us',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'United States',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Option,
    value: 'uk',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'United Kingdom',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Option,
    value: 'ca',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Canada',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
