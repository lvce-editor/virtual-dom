import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const nodeCount = 10_000

const $container = document.getElementById('diff-container')

const textNode = (text) => ({
  type: VirtualDomElements.Text,
  text,
  childCount: 0,
})

const divNode = (className) => ({
  type: VirtualDomElements.Div,
  className,
  childCount: 0,
})

const rootNode = (childCount) => ({
  type: VirtualDomElements.Div,
  childCount,
})

const createTextNodes = (prefix) => {
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(textNode(`${prefix}-${i};`))
  }
  return nodes
}

const createElementNodes = (prefix) => {
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(divNode(`${prefix}-${i}`))
  }
  return nodes
}

const createDom = (children) => [rootNode(children.length), ...children]

const scenarios = {
  'add-text-nodes': {
    initialDom: createDom([]),
    updatedDom: createDom(createTextNodes('text')),
  },
  'add-direct-element-nodes': {
    initialDom: createDom([]),
    updatedDom: createDom(createElementNodes('item')),
  },
  'remove-direct-element-nodes': {
    initialDom: createDom(createElementNodes('remove')),
    updatedDom: createDom([]),
  },
}

const scenarioName = location.hash.slice(1)
const scenario = scenarios[scenarioName]

if (!scenario) {
  throw new Error(`Unknown large DOM diff scenario: ${scenarioName}`)
}

renderInto($container, scenario.initialDom)

const patches = diffTree(scenario.initialDom, scenario.updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomLargeDiffResult = {
  scenarioName,
  patchCount: patches.length,
  childNodeCount: $root.childNodes.length,
  childElementCount: $root.childElementCount,
  firstNodeValue: $root.firstChild?.nodeValue ?? '',
  lastNodeValue: $root.lastChild?.nodeValue ?? '',
  firstElementClassName: $root.firstElementChild?.className ?? '',
  lastElementClassName: $root.lastElementChild?.className ?? '',
  textContentLength: $root.textContent.length,
}
window.__virtualDomDiffTestComplete = true
