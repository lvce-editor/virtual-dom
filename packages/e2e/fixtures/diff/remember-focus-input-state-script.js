import {
  renderInto,
  rememberFocus,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    type: VirtualDomElements.Div,
    id: 'viewlet',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Input,
    id: 'remembered-input',
    className: 'before-input',
    inputType: 'text',
    name: 'query',
    placeholder: 'Before',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    id: 'remembered-status',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'before',
    childCount: 0,
  },
]

renderInto($container, initialDom)

const $viewlet = document.getElementById('viewlet')
$viewlet.style.left = '11px'
$viewlet.style.top = '13px'
$viewlet.style.width = '250px'
$viewlet.style.height = '90px'

const $input = document.getElementById('remembered-input')
$input.focus()
$input.value = 'typed query'

const updatedDom = [
  {
    type: VirtualDomElements.Div,
    id: 'viewlet',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Input,
    id: 'remembered-input',
    className: 'after-input',
    inputType: 'text',
    name: 'query',
    placeholder: 'After',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Span,
    id: 'remembered-status',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'after',
    childCount: 0,
  },
]

const $newViewlet = rememberFocus($viewlet, updatedDom, {}, 777)
const $newInput = document.getElementById('remembered-input')

window.__virtualDomRememberFocusResult = {
  activeElementId: document.activeElement.id,
  className: $newInput.className,
  height: $newViewlet.style.height,
  left: $newViewlet.style.left,
  placeholder: $newInput.placeholder,
  statusText: document.getElementById('remembered-status').textContent,
  top: $newViewlet.style.top,
  value: $newInput.value,
  width: $newViewlet.style.width,
}
window.__virtualDomDiffTestComplete = true
