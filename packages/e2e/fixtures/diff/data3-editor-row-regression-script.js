import { applyPatch, VirtualDomElements } from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')
const editorUid = 0.7704051740893684
const instances = new Map()

const token = (className, text) => [
  {
    childCount: 1,
    className,
    type: VirtualDomElements.Span,
  },
  {
    childCount: 0,
    text,
    type: VirtualDomElements.Text,
  },
]

const editorRow = (tokens) => [
  {
    childCount: tokens.length,
    className: 'EditorRow',
    translate: '0px',
    type: VirtualDomElements.Div,
  },
  ...tokens.flatMap(([className, text]) => token(className, text)),
]

const oldDom = editorRow([
  ['Token Whitespace', '    '],
  ['Token Punctuation', '"'],
  ['Token JsonPropertyName', 'node_modules/@babel/helper-validator-identifier'],
  ['Token Punctuation', '"'],
  ['Token Punctuation', ':'],
  ['Token Whitespace', ' '],
  ['Token Punctuation', '{'],
])

const newDom = editorRow([
  ['Token Whitespace', '    '],
  ['Token Punctuation', '"'],
  ['Token JsonPropertyName', '@cspell/dict-dotnet'],
  ['Token Punctuation', '"'],
  ['Token Punctuation', ':'],
  ['Token Whitespace', ' '],
  ['Token Punctuation', '"'],
  ['Token JsonPropertyValueString', '^5.0.13'],
  ['Token Punctuation', '"'],
  ['Token Punctuation', ','],
])

const commands = [
  ['Viewlet.createFunctionalRoot', 'Editor', editorUid, true],
  [
    'Viewlet.setPatches',
    editorUid,
    [
      {
        type: 6,
        nodes: oldDom,
      },
    ],
  ],
  ['Viewlet.setPatches', editorUid, diffTree(oldDom, newDom)],
]

const createFunctionalRoot = (viewletName, uid) => {
  const $viewlet = document.createElement('div')
  $viewlet.dataset.viewlet = viewletName
  $container.append($viewlet)
  instances.set(uid, $viewlet)
}

const setPatches = (uid, patches) => {
  const $viewlet = instances.get(uid)
  applyPatch($viewlet, patches, {}, uid)
  if ($viewlet.childElementCount === 1 && $viewlet.dataset.viewlet) {
    instances.set(uid, $viewlet.firstElementChild)
  }
}

for (const [method, ...args] of commands) {
  switch (method) {
    case 'Viewlet.createFunctionalRoot':
      createFunctionalRoot(args[0], args[1])
      break
    case 'Viewlet.setPatches':
      setPatches(args[0], args[1])
      break
    default:
      break
  }
}

window.__virtualDomDiffTestComplete = true
