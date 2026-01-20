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
    type: VirtualDomElements.Nav,
    childCount: 1,
  },
  {
    type: VirtualDomElements.A,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Home',
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
    type: VirtualDomElements.Nav,
    className: 'main-nav',
    childCount: 3,
  },
  {
    type: VirtualDomElements.A,
    href: '/',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Home',
    childCount: 0,
  },
  {
    type: VirtualDomElements.A,
    href: '/about',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'About',
    childCount: 0,
  },
  {
    type: VirtualDomElements.A,
    href: '/contact',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'Contact',
    childCount: 0,
  },
]

const patches = diff(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
