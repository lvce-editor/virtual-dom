import {
  renderInto,
  applyPatch,
  VirtualDomElements,
  setViewletInstance,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const $container = document.getElementById('diff-container')

// Mock viewlet instance for reference node
const mockViewletInstance = {
  state: {
    $Viewlet: document.createElement('span'),
  },
}

// Set up the reference node with a UID
const referenceNodeUid = 'ref-uid-1'
mockViewletInstance.state.$Viewlet.textContent = 'Referenced Component'
setViewletInstance(referenceNodeUid, mockViewletInstance)

const initialDom = [
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
    src: '/extensions/builtin.vscode-icons/icons/file_type_typescript.svg',
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
    uid: 'ref-uid-1',
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
    childCount: 3,
    className: 'editor-groups-container EditorGroupsVertical',
    role: 'none',
    type: 4,
  },
  {
    childCount: 2,
    className: 'EditorGroup',
    style: 'width:50%;',
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
    src: '/extensions/builtin.vscode-icons/icons/file_type_typescript.svg',
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
    uid: 'ref-uid-1',
  },
  {
    childCount: 1,
    className: 'Sash SashVertical',
    'data-sashId': '0.4729672533032693:0.10762292933832784',
    onPointerDown: 16,
    style: 'left:50%;',
    type: 4,
  },
  {
    childCount: 0,
    className: 'SashBoard',
    type: 4,
  },
  {
    childCount: 2,
    className: 'EditorGroup',
    style: 'width:50%;',
    type: 4,
  },
  {
    childCount: 1,
    className: 'EmptyGroupCloseButton',
    'data-groupId': '0.10762292933832784',
    name: 'close-group',
    onClick: 10,
    title: 'Close Editor Group',
    type: 1,
  },
  {
    childCount: 0,
    text: '✕',
    type: 12,
  },
  {
    childCount: 1,
    className: 'WaterMarkWrapper',
    type: 4,
  },
  {
    childCount: 0,
    className: 'WaterMark',
    type: 4,
  },
]

const patches = diffTree(initialDom, updatedDom)
const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
