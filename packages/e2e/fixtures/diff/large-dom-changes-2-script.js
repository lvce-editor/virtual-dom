import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const nodeCount = 10_000
const middleIndex = nodeCount / 2

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

const divNodeWithData = (value) => ({
  type: VirtualDomElements.Div,
  'data-value': value,
  childCount: 0,
})

const divNodeWithoutClass = () => ({
  type: VirtualDomElements.Div,
  childCount: 0,
})

const rootNode = (childCount) => ({
  type: VirtualDomElements.Div,
  childCount,
})

const createTextNodes = (prefix, count = nodeCount) => {
  const nodes = []
  for (let i = 0; i < count; i++) {
    nodes.push(textNode(`${prefix}-${i};`))
  }
  return nodes
}

const createElementNodes = (prefix, count = nodeCount) => {
  const nodes = []
  for (let i = 0; i < count; i++) {
    nodes.push(divNode(`${prefix}-${i}`))
  }
  return nodes
}

const createElementRange = (prefix, start, end) => {
  const nodes = []
  for (let i = start; i < end; i++) {
    nodes.push(divNode(`${prefix}-${i}`))
  }
  return nodes
}

const createTextRange = (prefix, start, end) => {
  const nodes = []
  for (let i = start; i < end; i++) {
    nodes.push(textNode(`${prefix}-${i};`))
  }
  return nodes
}

const createElementsWithoutClass = () => {
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(divNodeWithoutClass())
  }
  return nodes
}

const createElementsWithData = (prefix) => {
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    nodes.push(divNodeWithData(`${prefix}-${i}`))
  }
  return nodes
}

const createDom = (children) => [rootNode(children.length), ...children]

const scenarios = {
  'add-text-nodes': () => ({
    initialDom: createDom([]),
    updatedDom: createDom(createTextNodes('text')),
  }),
  'add-direct-element-nodes': () => ({
    initialDom: createDom([]),
    updatedDom: createDom(createElementNodes('item')),
  }),
  'remove-direct-element-nodes': () => ({
    initialDom: createDom(createElementNodes('remove')),
    updatedDom: createDom([]),
  }),
  'update-text-nodes': () => ({
    initialDom: createDom(createTextNodes('old')),
    updatedDom: createDom(createTextNodes('new')),
  }),
  'change-element-class-names': () => ({
    initialDom: createDom(createElementNodes('old-item')),
    updatedDom: createDom(createElementNodes('new-item')),
  }),
  'insert-element-at-beginning': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom([divNode('inserted'), ...createElementNodes('item')]),
  }),
  'insert-element-in-middle': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom([
      ...createElementRange('item', 0, middleIndex),
      divNode('inserted'),
      ...createElementRange('item', middleIndex, nodeCount),
    ]),
  }),
  'remove-first-element': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom(createElementRange('item', 1, nodeCount)),
  }),
  'remove-middle-element': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom([
      ...createElementRange('item', 0, middleIndex),
      ...createElementRange('item', middleIndex + 1, nodeCount),
    ]),
  }),
  'remove-last-element': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom(createElementRange('item', 0, nodeCount - 1)),
  }),
  'replace-elements-with-text': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom(createTextNodes('text')),
  }),
  'replace-text-with-elements': () => ({
    initialDom: createDom(createTextNodes('text')),
    updatedDom: createDom(createElementNodes('item')),
  }),
  'remove-element-class-names': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom(createElementsWithoutClass()),
  }),
  'add-element-data-attributes': () => ({
    initialDom: createDom(createElementsWithoutClass()),
    updatedDom: createDom(createElementsWithData('value')),
  }),
  'large-sequential-add-remove': () => ({
    initialDom: createDom([]),
    updatedDoms: [createDom(createElementNodes('item')), createDom([])],
  }),
  'special-character-text': () => ({
    initialDom: createDom([textNode('')]),
    updatedDom: createDom([textNode('<button>&"quoted"</button>')]),
  }),
  'whitespace-text-nodes': () => ({
    initialDom: createDom(createTextNodes('old-space', 3)),
    updatedDom: createDom([
      textNode('  leading'),
      textNode('\nline\n'),
      textNode('trailing  '),
    ]),
  }),
  'mixed-first-middle-last-changes': () => ({
    initialDom: createDom(createTextNodes('stable')),
    updatedDom: createDom([
      textNode('changed-first;'),
      ...createTextRange('stable', 1, middleIndex),
      textNode('changed-middle;'),
      ...createTextRange('stable', middleIndex + 1, nodeCount - 1),
      textNode('changed-last;'),
    ]),
  }),
  'replace-middle-element-with-text': () => ({
    initialDom: createDom(createElementNodes('item')),
    updatedDom: createDom([
      ...createElementRange('item', 0, middleIndex),
      textNode('middle-text;'),
      ...createElementRange('item', middleIndex + 1, nodeCount),
    ]),
  }),
}

const getChildInfo = ($root, index) => {
  const $child = $root.childNodes[index]
  return {
    className: $child?.className ?? '',
    dataValue: $child?.dataset?.value ?? '',
    nodeType: $child?.nodeType ?? 0,
    nodeValue: $child?.nodeValue ?? '',
    textContent: $child?.textContent ?? '',
  }
}

const applyDiffs = ($root, initialDom, updatedDoms) => {
  let currentDom = initialDom
  let patchCount = 0
  for (const updatedDom of updatedDoms) {
    const patches = diffTree(currentDom, updatedDom)
    applyPatch($root, patches)
    patchCount += patches.length
    currentDom = updatedDom
  }
  return patchCount
}

const getResult = ($root, scenarioName, patchCount) => {
  const childNodeCount = $root.childNodes.length
  return {
    scenarioName,
    patchCount,
    childNodeCount,
    childElementCount: $root.childElementCount,
    firstNodeValue: $root.firstChild?.nodeValue ?? '',
    lastNodeValue: $root.lastChild?.nodeValue ?? '',
    firstElementClassName: $root.firstElementChild?.className ?? '',
    lastElementClassName: $root.lastElementChild?.className ?? '',
    firstElementDataValue: $root.firstElementChild?.dataset?.value ?? '',
    lastElementDataValue: $root.lastElementChild?.dataset?.value ?? '',
    textContent: $root.textContent,
    textContentLength: $root.textContent.length,
    child0: getChildInfo($root, 0),
    child1: getChildInfo($root, 1),
    child4999: getChildInfo($root, 4_999),
    child5000: getChildInfo($root, 5_000),
    child5001: getChildInfo($root, 5_001),
    lastChild: getChildInfo($root, childNodeCount - 1),
  }
}

const scenarioName = location.hash.slice(1)
const createScenario = scenarios[scenarioName]

if (!createScenario) {
  throw new Error(`Unknown large DOM diff scenario: ${scenarioName}`)
}

const scenario = createScenario()
const updatedDoms = scenario.updatedDoms || [scenario.updatedDom]

renderInto($container, scenario.initialDom)

const $root = $container.firstElementChild
const patchCount = applyDiffs($root, scenario.initialDom, updatedDoms)

window.__virtualDomLargeDiffResult = getResult($root, scenarioName, patchCount)
window.__virtualDomDiffTestComplete = true
