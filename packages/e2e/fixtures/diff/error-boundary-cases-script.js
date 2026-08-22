import {
  applyPatch,
  renderInto,
  setViewletInstance,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const PatchType = {
  SetText: 1,
  SetAttribute: 3,
  NavigateChild: 7,
  NavigateParent: 8,
  NavigateSibling: 10,
  SetReferenceNodeUid: 11,
}

const text = (value) => ({
  type: VirtualDomElements.Text,
  text: value,
  childCount: 0,
})

const element = (type, properties = {}, children = []) => ({
  type,
  properties,
  children,
})

const flatten = (node) => [
  {
    type: node.type,
    ...node.properties,
    childCount: node.children.length,
  },
  ...node.children.flatMap(flatten),
]

const div = (children = [], properties = {}) =>
  element(VirtualDomElements.Div, properties, children)
const span = (value, properties = {}) =>
  element(VirtualDomElements.Span, properties, [
    element(VirtualDomElements.Text, { text: value }),
  ])

const $container = document.getElementById('diff-container')

const createRootWithChild = () => {
  const $root = document.createElement('div')
  const $child = document.createElement('span')
  $child.textContent = 'stable'
  $root.append($child)
  $container.append($root)
  return { $root, $child }
}

const navigationFailure = (patches, startAtChild = false) => {
  const { $root, $child } = createRootWithChild()
  applyPatch(startAtChild ? $child : $root, patches)
  return {
    html: $container.innerHTML,
    rootId: $root.id,
  }
}

const applyPatchCases = {
  'navigate-child-negative': () =>
    navigationFailure([
      { type: PatchType.NavigateChild, index: -1 },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ]),
  'navigate-child-too-large': () =>
    navigationFailure([
      { type: PatchType.NavigateChild, index: 2 },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ]),
  'navigate-child-at-end-without-insert': () =>
    navigationFailure([
      { type: PatchType.NavigateChild, index: 1 },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ]),
  'navigate-sibling-negative': () =>
    navigationFailure(
      [
        { type: PatchType.NavigateSibling, index: -1 },
        { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
      ],
      true,
    ),
  'navigate-sibling-too-large': () =>
    navigationFailure(
      [
        { type: PatchType.NavigateSibling, index: 2 },
        { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
      ],
      true,
    ),
  'navigate-sibling-detached': () => {
    const $node = document.createElement('span')
    applyPatch($node, [
      { type: PatchType.NavigateSibling, index: 0 },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ])
    return { id: $node.id, connected: $node.isConnected }
  },
  'navigate-parent-detached': () => {
    const $node = document.createElement('div')
    applyPatch($node, [
      { type: PatchType.NavigateParent },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ])
    return { id: $node.id, connected: $node.isConnected }
  },
  'reference-instance-missing': () => {
    const { $child } = createRootWithChild()
    applyPatch($child, [
      { type: PatchType.SetReferenceNodeUid, uid: 'missing-instance' },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ])
    return { html: $container.innerHTML }
  },
  'reference-state-missing': () => {
    setViewletInstance('missing-state', {})
    const { $child } = createRootWithChild()
    applyPatch($child, [
      { type: PatchType.SetReferenceNodeUid, uid: 'missing-state' },
      { type: PatchType.SetAttribute, key: 'id', value: 'changed' },
    ])
    return { html: $container.innerHTML }
  },
  'mutation-error-stops-following-patches': () => {
    const $node = document.createTextNode('before')
    $container.append($node)
    let thrown = ''
    try {
      applyPatch($node, [
        {
          type: PatchType.SetAttribute,
          key: 'aria-label',
          value: 'invalid-on-text',
        },
        { type: PatchType.SetText, value: 'after' },
      ])
    } catch (error) {
      thrown = error instanceof Error ? error.message : String(error)
    }
    return { text: $node.nodeValue, thrown }
  },
}

const renderCases = {
  'render-empty-clears-existing-content': () => {
    $container.innerHTML = '<p>stale</p>'
    renderInto($container, [])
    return {
      html: $container.innerHTML,
      childCount: $container.childNodes.length,
    }
  },
  'render-root-fragment': () => {
    renderInto($container, [
      text('before'),
      ...flatten(span('middle')),
      text('after'),
    ])
    return {
      html: $container.innerHTML,
      nodeTypes: [...$container.childNodes].map((node) => node.nodeType),
    }
  },
  'render-empty-text-boundaries': () => {
    renderInto(
      $container,
      flatten(
        div([
          element(VirtualDomElements.Text, { text: '' }),
          span('middle'),
          element(VirtualDomElements.Text, { text: '' }),
        ]),
      ),
    )
    const $root = $container.firstChild
    return {
      childCount: $root.childNodes.length,
      nodeTypes: [...$root.childNodes].map((node) => node.nodeType),
      nodeValues: [...$root.childNodes].map((node) => node.nodeValue),
    }
  },
  'render-nested-empty-siblings': () => {
    renderInto(
      $container,
      flatten(
        div([
          element(VirtualDomElements.Section, { id: 'first' }),
          div([element(VirtualDomElements.Span, { id: 'nested-empty' })], {
            id: 'middle',
          }),
          element(VirtualDomElements.Section, { id: 'last' }),
        ]),
      ),
    )
    return { html: $container.innerHTML }
  },
  'render-reference-instance-missing': () => {
    renderInto($container, [
      {
        type: VirtualDomElements.Reference,
        uid: 'unknown-render-reference',
        childCount: 0,
      },
    ])
    return {
      html: $container.innerHTML,
      nodeType: $container.firstChild.nodeType,
    }
  },
  'render-reference-state-missing': () => {
    setViewletInstance('render-reference-no-state', {})
    renderInto($container, [
      {
        type: VirtualDomElements.Reference,
        uid: 'render-reference-no-state',
        childCount: 0,
      },
    ])
    return {
      html: $container.innerHTML,
      nodeType: $container.firstChild.nodeType,
    }
  },
  'render-reference-applies-props': () => {
    const $viewlet = document.createElement('button')
    $viewlet.textContent = 'external'
    setViewletInstance('render-reference-with-props', {
      state: { $Viewlet: $viewlet },
    })
    renderInto($container, [
      {
        type: VirtualDomElements.Reference,
        uid: 'render-reference-with-props',
        id: 'reference-button',
        className: 'reference-class',
        title: 'Reference title',
        childCount: 0,
      },
    ])
    return {
      html: $container.innerHTML,
      sameNode: $container.firstChild === $viewlet,
    }
  },
  'render-missing-event-listener': () => {
    renderInto($container, [
      {
        type: VirtualDomElements.Button,
        id: 'missing-listener-button',
        onClick: 999,
        childCount: 1,
      },
      text('click'),
    ])
    document.getElementById('missing-listener-button').click()
    return { html: $container.innerHTML }
  },
  'render-zero-and-false-props': () => {
    renderInto($container, [
      {
        type: VirtualDomElements.Div,
        id: 0,
        'data-zero': 0,
        'aria-hidden': false,
        childCount: 0,
      },
    ])
    const $target = $container.firstElementChild
    return {
      id: $target.getAttribute('id'),
      dataZero: $target.getAttribute('data-zero'),
      ariaHidden: $target.getAttribute('aria-hidden'),
    }
  },
  'render-zero-dimensions': () => {
    renderInto($container, [
      { type: VirtualDomElements.Div, childCount: 2 },
      {
        type: VirtualDomElements.Div,
        id: 'zero-size-div',
        width: 0,
        height: 0,
        childCount: 0,
      },
      {
        type: VirtualDomElements.Img,
        id: 'zero-size-image',
        width: 0,
        height: 0,
        childCount: 0,
      },
    ])
    const $div = document.getElementById('zero-size-div')
    const $image = document.getElementById('zero-size-image')
    return {
      divWidth: $div.style.width,
      divHeight: $div.style.height,
      imageWidth: $image.width,
      imageHeight: $image.height,
    }
  },
}

const applyDiff = (initialDom, updatedDom, startAtContainer = false) => {
  renderInto($container, initialDom)
  const $oldRoot = $container.firstChild
  const patches = diffTree(initialDom, updatedDom)
  applyPatch(startAtContainer ? $container : $oldRoot, patches)
  return patches
}

const diffCases = {
  'diff-identical-preserves-node': () => {
    const dom = flatten(div([span('stable', { id: 'stable-child' })]))
    renderInto($container, dom)
    const $root = $container.firstChild
    const $child = document.getElementById('stable-child')
    const patches = diffTree(dom, dom)
    applyPatch($root, patches)
    return {
      patchCount: patches.length,
      rootPreserved: $container.firstChild === $root,
      childPreserved: document.getElementById('stable-child') === $child,
    }
  },
  'diff-empty-fragments': () => {
    const patches = diffTree([], [])
    applyPatch($container, patches)
    return { patchCount: patches.length, html: $container.innerHTML }
  },
  'diff-add-only-root': () => {
    const updatedDom = flatten(div([span('added')], { id: 'added-root' }))
    const patches = applyDiff([], updatedDom, true)
    return { patchCount: patches.length, html: $container.innerHTML }
  },
  'diff-remove-only-root': () => {
    const initialDom = flatten(div([span('removed')], { id: 'removed-root' }))
    const patches = applyDiff(initialDom, [], true)
    return { patchCount: patches.length, html: $container.innerHTML }
  },
  'diff-root-element-to-text': () => {
    const initialDom = flatten(div([span('old')]))
    const updatedDom = [text('plain')]
    const patches = applyDiff(initialDom, updatedDom)
    return {
      patchCount: patches.length,
      html: $container.innerHTML,
      nodeType: $container.firstChild.nodeType,
    }
  },
  'diff-root-text-to-element': () => {
    const initialDom = [text('plain')]
    const updatedDom = flatten(span('new', { id: 'new-root' }))
    const patches = applyDiff(initialDom, updatedDom)
    return {
      patchCount: patches.length,
      html: $container.innerHTML,
      nodeType: $container.firstChild.nodeType,
    }
  },
  'diff-text-empty-round-trip': () => {
    let dom = flatten(
      div([element(VirtualDomElements.Text, { text: 'value' })]),
    )
    renderInto($container, dom)
    const $root = $container.firstChild
    const emptyDom = flatten(
      div([element(VirtualDomElements.Text, { text: '' })]),
    )
    applyPatch($root, diffTree(dom, emptyDom))
    const emptyChildCount = $root.childNodes.length
    dom = emptyDom
    const restoredDom = flatten(
      div([element(VirtualDomElements.Text, { text: 'restored' })]),
    )
    applyPatch($root, diffTree(dom, restoredDom))
    return {
      emptyChildCount,
      html: $container.innerHTML,
      nodeType: $root.firstChild.nodeType,
    }
  },
  'diff-append-root-to-fragment': () => {
    const initialDom = [...flatten(span('one')), ...flatten(span('two'))]
    const updatedDom = [
      ...initialDom,
      ...flatten(span('three', { id: 'third-root' })),
    ]
    const patches = applyDiff(initialDom, updatedDom, true)
    return {
      patchCount: patches.length,
      html: $container.innerHTML,
      childCount: $container.childNodes.length,
    }
  },
  'diff-remove-middle-root-from-fragment': () => {
    const first = flatten(span('one', { id: 'first-root' }))
    const middle = flatten(span('two', { id: 'middle-root' }))
    const last = flatten(span('three', { id: 'last-root' }))
    const initialDom = [...first, ...middle, ...last]
    const updatedDom = [...first, ...last]
    const patches = applyDiff(initialDom, updatedDom, true)
    return {
      patchCount: patches.length,
      html: $container.innerHTML,
      childCount: $container.childNodes.length,
    }
  },
  'diff-replace-root-and-update-sibling': () => {
    const initialDom = [
      ...flatten(div([span('old')], { id: 'replace-me' })),
      ...flatten(span('stable', { id: 'sibling', className: 'before' })),
    ]
    const updatedDom = [
      ...flatten(span('new', { id: 'replacement' })),
      ...flatten(span('stable', { id: 'sibling', className: 'after' })),
    ]
    const patches = applyDiff(initialDom, updatedDom, true)
    return { patchCount: patches.length, html: $container.innerHTML }
  },
}

const cases = {
  ...applyPatchCases,
  ...renderCases,
  ...diffCases,
}

const errors = []
const warnings = []
console.error = (...args) => {
  errors.push(args.map(String).join(' '))
}
console.warn = (...args) => {
  warnings.push(args.map(String).join(' '))
}

const caseName = location.hash.slice(1)
const runCase = cases[caseName]

if (!runCase) {
  throw new Error(`Unknown error or boundary case: ${caseName}`)
}

globalThis.__virtualDomErrorBoundaryResult = {
  ...runCase(),
  errors,
  warnings,
}
globalThis.__virtualDomDiffTestComplete = true
