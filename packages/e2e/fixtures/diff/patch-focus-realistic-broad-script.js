import {
  applyDiff,
  createCaseRoot,
  patchDom,
  text,
} from './broad-test-helpers.js'
import {
  registerEventListeners,
  rememberFocus,
  renderInto,
  setIpc,
  setViewletInstance,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
setIpc({
  send(method, ...args) {
    commands.push({ method, args })
  },
})

const childText = ($element) =>
  Array.from($element.childNodes, (node) => node.textContent)

const runReferenceAndMixedPatchCases = () => {
  const $mount = createCaseRoot('reference-mixed-case')
  const $reference = document.createElement('span')
  $reference.id = 'reference-node-broad'
  $reference.textContent = 'REF'
  setViewletInstance('broad-reference', { state: { $Viewlet: $reference } })
  let dom = [
    { type: VirtualDomElements.Div, id: 'reference-mixed-root', childCount: 3 },
    text('A'),
    {
      type: VirtualDomElements.Reference,
      uid: 'broad-reference',
      childCount: 0,
    },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B'),
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, id: 'reference-mixed-root', childCount: 5 },
    text(''),
    { type: VirtualDomElements.Span, childCount: 1 },
    text('before-ref'),
    {
      type: VirtualDomElements.Reference,
      uid: 'broad-reference',
      childCount: 0,
    },
    text('   '),
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B2'),
  ])
  const afterInsert = childText($root)
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, id: 'reference-mixed-root', childCount: 2 },
    {
      type: VirtualDomElements.Reference,
      uid: 'broad-reference',
      childCount: 0,
    },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B3'),
  ])
  return {
    afterInsert,
    afterRemove: childText($root),
    referenceConnected: document.getElementById('reference-node-broad')
      .isConnected,
  }
}

const runReorderAndReplacementCases = () => {
  const $mount = createCaseRoot('reorder-replacement-case')
  let dom = [
    { type: VirtualDomElements.Div, id: 'reorder-root', childCount: 4 },
    { type: VirtualDomElements.Span, className: 'first', childCount: 1 },
    text('duplicate'),
    text('middle text'),
    { type: VirtualDomElements.Button, className: 'third', childCount: 1 },
    text('duplicate'),
    { type: VirtualDomElements.Span, className: 'last', childCount: 1 },
    text('tail'),
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, id: 'reorder-root', childCount: 4 },
    { type: VirtualDomElements.Span, className: 'last', childCount: 1 },
    text('tail'),
    { type: VirtualDomElements.Button, className: 'third', childCount: 1 },
    text('duplicate'),
    text('middle text updated'),
    { type: VirtualDomElements.Span, className: 'first', childCount: 1 },
    text('duplicate'),
  ])
  const afterReorder = {
    text: $root.textContent,
    classes: Array.from($root.children, (child) => child.className),
    nodeTypes: Array.from($root.childNodes, (node) => node.nodeType),
  }
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, id: 'reorder-root', childCount: 1 },
    text('plain text replacement'),
  ])
  const afterElementToText = {
    text: $root.textContent,
    nodeType: $root.firstChild.nodeType,
  }
  patchDom($root, dom, [
    { type: VirtualDomElements.Div, id: 'reorder-root', childCount: 1 },
    {
      type: VirtualDomElements.Button,
      id: 'text-back-to-button',
      childCount: 1,
    },
    text('button again'),
  ])
  return {
    afterReorder,
    afterElementToText,
    afterTextToElement: {
      tagName: $root.firstElementChild.tagName,
      text: $root.textContent,
    },
  }
}

const runEmptyWhitespaceAndNestedRemoval = () => {
  const $mount = createCaseRoot('empty-whitespace-removal-case')
  let dom = [
    {
      type: VirtualDomElements.Div,
      id: 'empty-whitespace-root',
      childCount: 2,
    },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('A'),
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B'),
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    {
      type: VirtualDomElements.Div,
      id: 'empty-whitespace-root',
      childCount: 4,
    },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('A'),
    text(''),
    text('   '),
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B'),
  ])
  const afterWhitespaceInsert = {
    childCount: $root.childNodes.length,
    nodeValues: Array.from($root.childNodes, (node) => node.nodeValue),
    text: $root.textContent,
  }
  dom = patchDom($root, dom, [
    {
      type: VirtualDomElements.Div,
      id: 'empty-whitespace-root',
      childCount: 2,
    },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('A'),
    { type: VirtualDomElements.Span, childCount: 1 },
    text('B'),
  ])

  const nestedInitial = [
    {
      type: VirtualDomElements.Section,
      id: 'nested-removal-root',
      childCount: 2,
    },
    { type: VirtualDomElements.Ul, id: 'nested-removal-list', childCount: 5 },
    { type: VirtualDomElements.Li, childCount: 1 },
    text('one'),
    { type: VirtualDomElements.Li, childCount: 1 },
    text('two'),
    { type: VirtualDomElements.Li, childCount: 1 },
    text('three'),
    { type: VirtualDomElements.Li, childCount: 1 },
    text('four'),
    { type: VirtualDomElements.Li, childCount: 1 },
    text('five'),
    {
      type: VirtualDomElements.Aside,
      id: 'nested-removal-aside',
      childCount: 1,
    },
    text('aside'),
  ]
  const nestedUpdated = [
    {
      type: VirtualDomElements.Section,
      id: 'nested-removal-root',
      childCount: 1,
    },
    { type: VirtualDomElements.Ul, id: 'nested-removal-list', childCount: 2 },
    { type: VirtualDomElements.Li, childCount: 1 },
    text('one'),
    { type: VirtualDomElements.Li, childCount: 1 },
    text('five'),
  ]
  const $nestedMount = createCaseRoot('nested-removal-case')
  applyDiff($nestedMount, nestedInitial, nestedUpdated)
  return {
    afterWhitespaceInsert,
    afterWhitespaceRemove: {
      childCount: $root.childNodes.length,
      text: $root.textContent,
    },
    nestedRemoval: {
      listText: document.getElementById('nested-removal-list').textContent,
      itemCount: document.querySelectorAll('#nested-removal-list li').length,
      asideExists: Boolean(document.getElementById('nested-removal-aside')),
    },
  }
}

const runSequentialDiffsNoStaleListeners = () => {
  const $mount = createCaseRoot('sequential-diffs-listener-case')
  const calls = []
  const eventMap = {
    1() {
      calls.push('one')
    },
    2() {
      calls.push('two')
    },
    3() {
      calls.push('three')
    },
  }
  let dom = [
    { type: VirtualDomElements.Div, id: 'sequential-root', childCount: 2 },
    {
      type: VirtualDomElements.Button,
      id: 'sequential-button',
      onClick: 1,
      childCount: 1,
    },
    text('one'),
    { type: VirtualDomElements.Span, id: 'sequential-status', childCount: 1 },
    text('first'),
  ]
  renderInto($mount, dom, eventMap)
  const $root = $mount.firstElementChild
  const $button = document.getElementById('sequential-button')
  $button.click()
  dom = patchDom(
    $root,
    dom,
    [
      { type: VirtualDomElements.Div, id: 'sequential-root', childCount: 2 },
      {
        type: VirtualDomElements.Button,
        id: 'sequential-button',
        onClick: 2,
        childCount: 1,
      },
      text('two'),
      { type: VirtualDomElements.Span, id: 'sequential-status', childCount: 1 },
      text('second'),
    ],
    eventMap,
  )
  $button.click()
  patchDom(
    $root,
    dom,
    [
      { type: VirtualDomElements.Div, id: 'sequential-root', childCount: 2 },
      {
        type: VirtualDomElements.Button,
        id: 'sequential-button',
        onClick: 3,
        childCount: 1,
      },
      text('three'),
      { type: VirtualDomElements.Span, id: 'sequential-status', childCount: 1 },
      text('third'),
    ],
    eventMap,
  )
  $button.click()
  return {
    calls,
    buttonText: $button.textContent,
    statusText: document.getElementById('sequential-status').textContent,
  }
}

const runRememberFocusCases = () => {
  const $rootTreeMount = createCaseRoot('remember-root-tree-case')
  const rootTreeInitial = [
    {
      type: VirtualDomElements.Div,
      id: 'root-tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 1,
    },
    text('before'),
  ]
  renderInto($rootTreeMount, rootTreeInitial)
  const $rootTree = document.getElementById('root-tree')
  $rootTree.focus()
  const $newRootTree = rememberFocus(
    $rootTree,
    [
      {
        type: VirtualDomElements.Div,
        id: 'root-tree',
        role: 'tree',
        tabIndex: 0,
        childCount: 1,
      },
      text('after'),
    ],
    {},
    1001,
  )
  const rootTree = {
    activeElementId: document.activeElement.id,
    text: $newRootTree.textContent,
  }

  const $nestedTreeMount = createCaseRoot('remember-nested-tree-case')
  const nestedTreeInitial = [
    { type: VirtualDomElements.Div, id: 'nested-tree-viewlet', childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'nested-tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 1,
    },
    text('before'),
  ]
  renderInto($nestedTreeMount, nestedTreeInitial)
  const $nestedViewlet = document.getElementById('nested-tree-viewlet')
  document.getElementById('nested-tree').focus()
  const $newNestedViewlet = rememberFocus(
    $nestedViewlet,
    [
      {
        type: VirtualDomElements.Div,
        id: 'nested-tree-viewlet',
        childCount: 1,
      },
      {
        type: VirtualDomElements.Div,
        id: 'nested-tree',
        role: 'tree',
        tabIndex: 0,
        childCount: 1,
      },
      text('after'),
    ],
    {},
    1002,
  )
  const nestedTree = {
    activeElementId: document.activeElement.id,
    text: $newNestedViewlet.textContent,
  }

  const $inputMount = createCaseRoot('remember-input-parent-case')
  const inputInitial = [
    { type: VirtualDomElements.Div, id: 'input-parent-viewlet', childCount: 1 },
    { type: VirtualDomElements.Section, id: 'old-input-parent', childCount: 1 },
    {
      type: VirtualDomElements.Input,
      id: 'remember-parent-input',
      name: 'query',
      className: 'before-input',
      placeholder: 'Before',
      childCount: 0,
    },
  ]
  renderInto($inputMount, inputInitial)
  const $inputViewlet = document.getElementById('input-parent-viewlet')
  const $input = document.getElementById('remember-parent-input')
  $input.focus()
  $input.value = 'preserved text'
  const $newInputViewlet = rememberFocus(
    $inputViewlet,
    [
      {
        type: VirtualDomElements.Div,
        id: 'input-parent-viewlet',
        childCount: 1,
      },
      {
        type: VirtualDomElements.Article,
        id: 'new-input-parent',
        childCount: 1,
      },
      {
        type: VirtualDomElements.Input,
        id: 'remember-parent-input',
        name: 'query',
        className: 'after-input',
        placeholder: 'After',
        childCount: 0,
      },
    ],
    {},
    1003,
  )
  const $newInput = document.getElementById('remember-parent-input')
  const inputParent = {
    activeElementId: document.activeElement.id,
    value: $newInput.value,
    className: $newInput.className,
    placeholder: $newInput.placeholder,
    parentId: $newInput.parentElement.id,
    viewletText: $newInputViewlet.textContent,
  }

  return {
    rootTree,
    nestedTree,
    inputParent,
  }
}

const runRealisticFlows = () => {
  const uid = 907
  registerEventListeners(uid, [
    {
      name: 50,
      params: ['event.key', 'event.target.value'],
    },
  ])

  const $paletteMount = createCaseRoot('command-palette-flow')
  const paletteInitial = [
    { type: VirtualDomElements.Div, id: 'palette', childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'palette-input',
      name: 'command',
      role: 'combobox',
      ariaActivedescendant: 'command-open',
      childCount: 0,
    },
    { type: VirtualDomElements.Ul, id: 'palette-options', childCount: 2 },
    { type: VirtualDomElements.Li, id: 'command-open', childCount: 1 },
    text('Open File'),
    { type: VirtualDomElements.Li, id: 'command-save', childCount: 1 },
    text('Save File'),
  ]
  const paletteUpdated = [
    { type: VirtualDomElements.Div, id: 'palette', childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'palette-input',
      name: 'command',
      role: 'combobox',
      ariaActivedescendant: 'command-save',
      onKeydown: 50,
      childCount: 0,
    },
    { type: VirtualDomElements.Ul, id: 'palette-options', childCount: 2 },
    { type: VirtualDomElements.Li, id: 'command-save', childCount: 1 },
    text('Save File'),
    { type: VirtualDomElements.Li, id: 'command-open', childCount: 1 },
    text('Open File'),
  ]
  applyDiff($paletteMount, paletteInitial, paletteUpdated, {}, uid)
  const $paletteInput = document.getElementById('palette-input')
  $paletteInput.value = 'save'
  $paletteInput.dispatchEvent(
    new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }),
  )
  const commandPalette = {
    activeDescendant: $paletteInput.getAttribute('aria-activedescendant'),
    optionsText: document.getElementById('palette-options').textContent,
    keyCommand: commands.at(-1).args.slice(1),
  }

  const $fileTreeMount = createCaseRoot('file-tree-flow')
  const fileTreeInitial = [
    {
      type: VirtualDomElements.Div,
      id: 'file-tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      id: 'src-folder',
      role: 'treeitem',
      ariaOwns: 'src-children',
      childCount: 1,
    },
    text('src'),
    {
      type: VirtualDomElements.Div,
      id: 'readme-file',
      role: 'treeitem',
      className: 'selected',
      childCount: 1,
    },
    text('README.md'),
  ]
  const fileTreeUpdated = [
    {
      type: VirtualDomElements.Div,
      id: 'file-tree',
      role: 'tree',
      tabIndex: 0,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Div,
      id: 'src-folder',
      role: 'treeitem',
      ariaOwns: 'src-children',
      className: 'expanded selected',
      childCount: 1,
    },
    text('src'),
    {
      type: VirtualDomElements.Div,
      id: 'package-file',
      role: 'treeitem',
      childCount: 1,
    },
    text('package.json'),
  ]
  applyDiff($fileTreeMount, fileTreeInitial, fileTreeUpdated)
  const $fileTree = document.getElementById('file-tree')
  $fileTree.focus()
  const fileExplorer = {
    activeElementId: document.activeElement.id,
    text: $fileTree.textContent,
    selectedClass: document.getElementById('src-folder').className,
    oldFileExists: Boolean(document.getElementById('readme-file')),
  }

  const $searchMount = createCaseRoot('search-results-flow')
  const resultNodes = (prefix, count) =>
    Array.from({ length: count }, (_, index) => [
      { type: VirtualDomElements.Li, childCount: 1 },
      text(`${prefix} ${index}`),
    ]).flat()
  const searchInitial = [
    { type: VirtualDomElements.Div, id: 'search-flow', childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'search-flow-input',
      name: 'query',
      childCount: 0,
    },
    { type: VirtualDomElements.Ul, id: 'search-flow-results', childCount: 6 },
    ...resultNodes('before', 6),
  ]
  const searchUpdated = [
    { type: VirtualDomElements.Div, id: 'search-flow', childCount: 2 },
    {
      type: VirtualDomElements.Input,
      id: 'search-flow-input',
      name: 'query',
      childCount: 0,
    },
    { type: VirtualDomElements.Ul, id: 'search-flow-results', childCount: 10 },
    ...resultNodes('after', 10),
  ]
  renderInto($searchMount, searchInitial)
  const $searchInput = document.getElementById('search-flow-input')
  $searchInput.value = 'typed search'
  patchDom($searchMount.firstElementChild, searchInitial, searchUpdated)
  const searchResults = {
    value: $searchInput.value,
    count: document.querySelectorAll('#search-flow-results li').length,
    text: document.getElementById('search-flow-results').textContent,
  }

  const $settingsMount = createCaseRoot('settings-flow')
  const settingsInitial = [
    { type: VirtualDomElements.Div, id: 'settings-flow', childCount: 4 },
    {
      type: VirtualDomElements.Input,
      id: 'settings-name',
      name: 'name',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'settings-enabled',
      inputType: 'checkbox',
      name: 'enabled',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Select, id: 'settings-theme', childCount: 2 },
    { type: VirtualDomElements.Option, value: 'light', childCount: 1 },
    text('Light'),
    { type: VirtualDomElements.Option, value: 'dark', childCount: 1 },
    text('Dark'),
    { type: VirtualDomElements.Span, id: 'settings-status', childCount: 1 },
    text('clean'),
  ]
  const settingsUpdated = [
    { type: VirtualDomElements.Div, id: 'settings-flow', childCount: 4 },
    {
      type: VirtualDomElements.Input,
      id: 'settings-name',
      name: 'name',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Input,
      id: 'settings-enabled',
      inputType: 'checkbox',
      name: 'enabled',
      checked: false,
      childCount: 0,
    },
    { type: VirtualDomElements.Select, id: 'settings-theme', childCount: 2 },
    { type: VirtualDomElements.Option, value: 'light', childCount: 1 },
    text('Light'),
    { type: VirtualDomElements.Option, value: 'dark', childCount: 1 },
    text('Dark'),
    { type: VirtualDomElements.Span, id: 'settings-status', childCount: 1 },
    text('dirty'),
  ]
  renderInto($settingsMount, settingsInitial)
  document.getElementById('settings-name').value = 'Ada'
  document.getElementById('settings-enabled').checked = true
  document.getElementById('settings-theme').value = 'dark'
  patchDom($settingsMount.firstElementChild, settingsInitial, settingsUpdated)
  const settingsForm = {
    name: document.getElementById('settings-name').value,
    enabled: document.getElementById('settings-enabled').checked,
    theme: document.getElementById('settings-theme').value,
    status: document.getElementById('settings-status').textContent,
  }

  const $tabsMount = createCaseRoot('tabs-flow')
  const tabsInitial = [
    { type: VirtualDomElements.Div, id: 'tabs-flow', childCount: 3 },
    {
      type: VirtualDomElements.Button,
      id: 'tab-a',
      className: 'tab active',
      childCount: 1,
    },
    text('a.ts'),
    {
      type: VirtualDomElements.Button,
      id: 'tab-b',
      className: 'tab',
      childCount: 1,
    },
    text('b.ts'),
    {
      type: VirtualDomElements.Button,
      id: 'tab-c',
      className: 'tab',
      childCount: 1,
    },
    text('c.ts'),
  ]
  const tabsUpdated = [
    { type: VirtualDomElements.Div, id: 'tabs-flow', childCount: 2 },
    {
      type: VirtualDomElements.Button,
      id: 'tab-c',
      className: 'tab active',
      childCount: 1,
    },
    text('c.ts'),
    {
      type: VirtualDomElements.Button,
      id: 'tab-a',
      className: 'tab',
      childCount: 1,
    },
    text('a.ts'),
  ]
  applyDiff($tabsMount, tabsInitial, tabsUpdated)
  document.getElementById('tab-c').focus()
  const editorTabs = {
    labels: Array.from(
      document.querySelectorAll('#tabs-flow button'),
      (button) => button.textContent,
    ),
    activeId: document.querySelector('#tabs-flow .active').id,
    focusedId: document.activeElement.id,
    closedExists: Boolean(document.getElementById('tab-b')),
  }

  const $notificationsMount = createCaseRoot('notifications-flow-case')
  const notificationCalls = []
  const notificationEvents = {
    close() {
      notificationCalls.push('close')
    },
    action() {
      notificationCalls.push('action')
    },
  }
  const notificationsInitial = [
    { type: VirtualDomElements.Div, id: 'notifications-flow', childCount: 2 },
    { type: VirtualDomElements.Div, id: 'toast-one', childCount: 2 },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('Saved'),
    { type: VirtualDomElements.Button, onClick: 'close', childCount: 1 },
    text('Close'),
    { type: VirtualDomElements.Div, id: 'toast-two', childCount: 2 },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('Updated'),
    { type: VirtualDomElements.Button, onClick: 'action', childCount: 1 },
    text('Open'),
  ]
  const notificationsUpdated = [
    { type: VirtualDomElements.Div, id: 'notifications-flow', childCount: 2 },
    { type: VirtualDomElements.Div, id: 'toast-two', childCount: 2 },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('Updated'),
    { type: VirtualDomElements.Button, onClick: 'action', childCount: 1 },
    text('Open'),
    { type: VirtualDomElements.Div, id: 'toast-three', childCount: 2 },
    { type: VirtualDomElements.Span, childCount: 1 },
    text('Synced'),
    { type: VirtualDomElements.Button, onClick: 'close', childCount: 1 },
    text('Close'),
  ]
  renderInto($notificationsMount, notificationsInitial, notificationEvents)
  document.querySelector('#toast-one button').click()
  patchDom(
    $notificationsMount.firstElementChild,
    notificationsInitial,
    notificationsUpdated,
    notificationEvents,
  )
  document.querySelector('#toast-two button').click()
  document.querySelector('#toast-three button').click()
  const notifications = {
    calls: notificationCalls,
    toastIds: Array.from(
      document.querySelectorAll('#notifications-flow > div'),
      (toast) => toast.id,
    ),
    text: document.getElementById('notifications-flow').textContent,
  }

  return {
    commandPalette,
    fileExplorer,
    searchResults,
    settingsForm,
    editorTabs,
    notifications,
  }
}

window.__virtualDomBroadPatchFocusRealisticResult = {
  referenceAndMixedPatchCases: runReferenceAndMixedPatchCases(),
  reorderAndReplacementCases: runReorderAndReplacementCases(),
  emptyWhitespaceAndNestedRemoval: runEmptyWhitespaceAndNestedRemoval(),
  sequentialDiffsNoStaleListeners: runSequentialDiffsNoStaleListeners(),
  rememberFocusCases: runRememberFocusCases(),
  realisticFlows: runRealisticFlows(),
}
window.__virtualDomDiffTestComplete = true
