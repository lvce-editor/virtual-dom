import {
  renderInto,
  applyPatch,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const $container = document.getElementById('diff-container')

const initialDom = [
  {
    ariaLabel: 'Quick open',
    childCount: 2,
    className: 'Viewlet QuickPick',
    id: 'QuickPick',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 1,
    className: 'QuickPickHeader',
    type: VirtualDomElements.Div,
  },
  {
    ariaAutoComplete: 'list',
    ariaExpanded: true,
    ariaLabel: 'Type the name of a command to run.',
    autocapitalize: 'off',
    autocomplete: 'off',
    childCount: 0,
    className: 'InputBox',
    inputType: 'text',
    name: 'QuickPickInput',
    role: 'combobox',
    spellcheck: false,
    type: VirtualDomElements.Input,
  },
  {
    ariaActivedescendant: 'QuickPickItemActive',
    childCount: 1,
    className: 'List ContainContent',
    id: 'QuickPickItems',
    role: 'listbox',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 2,
    className: 'ListItems ContainContent',
    type: VirtualDomElements.Div,
  },
  {
    ariaPosInSet: 1,
    ariaSetSize: 2,
    childCount: 1,
    className: 'QuickPickItem QuickPickItemActive',
    id: 'QuickPickItemActive',
    role: 'option',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 1,
    className: 'QuickPickItemLabel',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 0,
    text: 'Layout: Close Chat',
    type: VirtualDomElements.Text,
  },
  {
    ariaPosInSet: 2,
    ariaSetSize: 2,
    childCount: 1,
    className: 'QuickPickItem',
    role: 'option',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 1,
    className: 'QuickPickItemLabel',
    type: VirtualDomElements.Div,
  },
  {
    childCount: 0,
    text: 'Window: Close',
    type: VirtualDomElements.Text,
  },
]

const patches = [
  {
    type: 7,
    index: 0,
  },
  {
    type: 7,
    index: 0,
  },
  {
    type: 10,
    index: 1,
  },
  {
    type: 7,
    index: 0,
  },
  {
    type: 9,
    index: 1,
  },
  {
    type: 9,
    index: 0,
  },
  {
    type: 6,
    nodes: [
      {
        childCount: 1,
        className: 'QuickPickItem QuickPickItemActive QuickPickStatus',
        type: VirtualDomElements.Div,
      },
      {
        childCount: 1,
        className: 'Label',
        type: VirtualDomElements.Div,
      },
      {
        childCount: 0,
        text: 'No Results',
        type: VirtualDomElements.Text,
      },
    ],
  },
]

renderInto($container, initialDom)

const $root = $container.firstElementChild
applyPatch($root, patches)

window.__virtualDomDiffTestComplete = true
