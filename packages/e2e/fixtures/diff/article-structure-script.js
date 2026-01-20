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
    type: VirtualDomElements.Article,
    childCount: 1,
  },
  {
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Content',
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
    type: VirtualDomElements.Article,
    childCount: 3,
  },
  {
    type: VirtualDomElements.Header,
    childCount: 1,
  },
  {
    type: VirtualDomElements.H1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Article Title',
    childCount: 0,
  },
  {
    type: VirtualDomElements.P,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Article Content',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Footer,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Footer',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
