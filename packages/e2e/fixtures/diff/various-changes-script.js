import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    childCount: 1,
    className: 'Main',
    type: 4,
  },
  {
    childCount: 0,
    className: 'editor-groups-container',
    role: 'none',
    type: 4,
  },
]

renderInto($container, initialDom)

const updatedDom = [
  {
    childCount: 1,
    className: 'Main',
    type: 4,
  },
  {
    childCount: 2,
    className: 'EditorGroup',
    style: 'width:100%;',
    type: 4,
  },
  {
    childCount: 1,
    className: 'EditorGroupHeader',
    onDblClick: 15,
    role: 'none',
    type: 4,
  },
  {
    childCount: 1,
    className: 'MainTabs',
    role: 'tablist',
    type: 4,
  },
  {
    'aria-selected': true,
    childCount: 3,
    className: 'MainTab MainTabSelected',
    'data-groupIndex': 0,
    'data-index': 0,
    onClick: 13,
    onContextMenu: 14,
    role: 'tab',
    title: 'memfs:///workspace/file1.ts',
    type: 4,
  },
  {
    childCount: 0,
    className: 'TabIcon',
    role: 'none',
    src: '/remote/home/simon/Documents/levivilet/lvce-editor/extensions/builtin.vscode-icons/icons/file_type_typescript.svg',
    type: 17,
  },
  {
    childCount: 1,
    className: 'TabTitle',
    type: 8,
  },
  {
    childCount: 0,
    text: 'file1.ts',
    type: 12,
  },
  {
    'aria-label': 'Close',
    childCount: 1,
    className: 'EditorTabCloseButton',
    'data-groupIndex': 0,
    'data-index': 0,
    onClick: 12,
    type: 1,
  },
  {
    childCount: 0,
    className: 'MaskIcon MaskIconClose',
    type: 4,
  },
  {
    childCount: 1,
    className: 'EditorContainer',
    type: 4,
  },
  {
    childCount: 0,
    type: 100,
    uid: 0.27357871529200806,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
