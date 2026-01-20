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
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Initial',
    childCount: 0,
  },
]

renderInto($container, initialDom)

// First diff: change text
let currentDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'First Update',
    childCount: 0,
  },
]

let patches = diffTree(initialDom, currentDom)
let $root = $container.firstElementChild
applyPatch($root, patches)

// Second diff: add class
const secondDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    className: 'highlighted',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'First Update',
    childCount: 0,
  },
]

patches = diffTree(currentDom, secondDom)
applyPatch($root, patches)
currentDom = secondDom

// Third diff: add another child
const thirdDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Span,
    className: 'highlighted',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'First Update',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Second Child',
    childCount: 0,
  },
]

patches = diffTree(currentDom, thirdDom)
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
