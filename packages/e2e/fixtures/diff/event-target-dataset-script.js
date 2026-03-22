import {
  renderInto,
  applyPatch,
  registerEventListeners,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const commands = []
const ipc = {
  send(method, ...args) {
    commands.push({ method, args })
  },
}

setIpc(ipc)

registerEventListeners(100, [
  {
    name: 1,
    params: [
      'event.target.dataset.groupIndex',
      'event.target.dataset.actionType',
      'event.target.dataset.empty',
      'event.target.dataset.missing',
    ],
  },
])

const initialDom = [
  {
    type: VirtualDomElements.Div,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'initial',
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
    type: VirtualDomElements.Button,
    id: 'dataset-btn',
    onClick: 1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Span,
    id: 'dataset-target',
    'data-groupIndex': '7',
    'data-actionType': 'open-file',
    'data-empty': '',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'nested',
    childCount: 0,
  },
  {
    type: VirtualDomElements.Button,
    id: 'dataset-btn-without-dataset',
    onClick: 1,
    childCount: 1,
  },
  {
    type: VirtualDomElements.Text,
    text: 'plain',
    childCount: 0,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches, {}, 100)

document.getElementById('dataset-target').click()
document.getElementById('dataset-btn-without-dataset').click()

window.__virtualDomDiffTestCommands = commands
window.__virtualDomDiffTestComplete = true
