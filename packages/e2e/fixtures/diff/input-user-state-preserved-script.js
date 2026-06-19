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
    childCount: 2,
  },
  {
    type: VirtualDomElements.Input,
    id: 'search-input',
    inputType: 'text',
    name: 'query',
    placeholder: 'Search',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    id: 'status',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'before',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const $input = document.getElementById('search-input')
$input.focus()
$input.value = 'hello user'
$input.setSelectionRange(2, 7)

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 2,
  },
  {
    type: VirtualDomElements.Input,
    id: 'search-input',
    inputType: 'text',
    name: 'query',
    className: 'search-updated',
    placeholder: 'Search files',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    id: 'status',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'after',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomInputStateResult = {
  activeElementId: document.activeElement.id,
  className: $input.className,
  placeholder: $input.placeholder,
  selectionEnd: $input.selectionEnd,
  selectionStart: $input.selectionStart,
  statusText: document.getElementById('status').textContent,
  value: $input.value,
}
window.__virtualDomDiffTestComplete = true
