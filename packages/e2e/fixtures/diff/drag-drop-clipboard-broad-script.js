import {
  applyDiff,
  createCaseRoot,
  patchDom,
  text,
} from './broad-test-helpers.js'
import {
  getFileHandles,
  registerEventListeners,
  setComponentUid,
  setDragInfo,
  setIpc,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const commands = []
setIpc({
  send(method, ...args) {
    commands.push({ method, args })
  },
})

const dispatchDragStart = ($target, dataTransfer) => {
  $target.dispatchEvent(
    new DragEvent('dragstart', {
      bubbles: true,
      cancelable: true,
      dataTransfer,
    }),
  )
}

const createDropEvent = (dataTransfer) =>
  new DragEvent('drop', {
    bubbles: true,
    cancelable: true,
    dataTransfer,
  })

const runDragInfo = () => {
  const $mount = createCaseRoot('drag-info-case')
  const uid = 904
  registerEventListeners(uid, [
    {
      name: 1,
      params: [],
    },
    {
      name: 2,
      params: [],
    },
  ])
  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Div,
      id: 'legacy-drag-target',
      draggable: true,
      onDragStart: 1,
      childCount: 1,
    },
    text('legacy'),
    {
      type: VirtualDomElements.Div,
      id: 'new-drag-target',
      draggable: true,
      onDragStart: 2,
      childCount: 1,
    },
    text('new'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)
  const $legacy = document.getElementById('legacy-drag-target')
  const $next = document.getElementById('new-drag-target')
  setComponentUid($legacy, 'legacy-drag')
  setComponentUid($next, 'new-drag')
  setDragInfo('legacy-drag', [
    {
      type: 'text/plain',
      data: 'legacy payload',
    },
  ])
  setDragInfo('new-drag', {
    label: 'Drag label',
    items: [
      {
        type: 'text/plain',
        data: 'new payload',
      },
    ],
  })
  const legacyTransfer = new DataTransfer()
  const newTransfer = new DataTransfer()
  dispatchDragStart($legacy, legacyTransfer)
  dispatchDragStart($next, newTransfer)
  return {
    legacyText: legacyTransfer.getData('text/plain'),
    newText: newTransfer.getData('text/plain'),
    newItemCount: newTransfer.items.length,
  }
}

const runDropAndClipboard = async () => {
  const $mount = createCaseRoot('drop-clipboard-case')
  const uid = 905
  registerEventListeners(uid, [
    {
      name: 10,
      params: ['event.dataTransfer.files'],
    },
    {
      name: 11,
      params: ['event.dataTransfer.files2'],
    },
    {
      name: 12,
      params: ['event.clipboardData.files'],
    },
  ])
  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 3 },
    {
      type: VirtualDomElements.Div,
      id: 'drop-files-target',
      onDrop: 10,
      childCount: 1,
    },
    text('drop files'),
    {
      type: VirtualDomElements.Div,
      id: 'drop-items-target',
      onDrop: 11,
      childCount: 1,
    },
    text('drop items'),
    {
      type: VirtualDomElements.Div,
      id: 'paste-target',
      onInput: 12,
      childCount: 1,
    },
    text('paste'),
  ]
  applyDiff($mount, initialDom, updatedDom, {}, uid)

  const fileTransfer = new DataTransfer()
  fileTransfer.items.add(
    new File(['hello'], 'hello.txt', { type: 'text/plain' }),
  )
  document
    .getElementById('drop-files-target')
    .dispatchEvent(createDropEvent(fileTransfer))
  const dropFiles = commands.at(-1).args[1]

  const itemTransfer = new DataTransfer()
  itemTransfer.items.add('plain text item', 'text/plain')
  document
    .getElementById('drop-items-target')
    .dispatchEvent(createDropEvent(itemTransfer))
  const itemIds = commands.at(-1).args[1]
  const itemValues = await getFileHandles(itemIds)

  const pasteFile = new File(['pasted'], 'pasted.txt', { type: 'text/plain' })
  const pasteEvent = new Event('input', { bubbles: true, cancelable: true })
  Object.defineProperty(pasteEvent, 'clipboardData', {
    value: {
      items: [
        {
          kind: 'file',
          getAsFile() {
            return pasteFile
          },
        },
      ],
    },
  })
  document.getElementById('paste-target').dispatchEvent(pasteEvent)
  const clipboardFiles = commands.at(-1).args[1]

  return {
    dropFileLength: dropFiles.length,
    dropFileName: dropFiles[0].name,
    file2IdsLength: itemIds.length,
    file2Kind: itemValues[0].kind,
    file2Type: itemValues[0].type,
    file2Value: itemValues[0].value,
    clipboardFileLength: clipboardFiles.length,
    clipboardFileName: clipboardFiles[0].name,
  }
}

const runUpdatedDragMetadata = () => {
  const $mount = createCaseRoot('updated-drag-metadata-case')
  const uid = 906
  registerEventListeners(uid, [
    {
      name: 20,
      params: [],
    },
    {
      name: 21,
      params: [],
    },
  ])
  const initialDom = [{ type: VirtualDomElements.Div, childCount: 0 }]
  let dom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'metadata-drag-target',
      draggable: true,
      onDragStart: 20,
      childCount: 1,
    },
    text('drag'),
  ]
  applyDiff($mount, initialDom, dom, {}, uid)
  const $root = $mount.firstElementChild
  const $target = document.getElementById('metadata-drag-target')
  setComponentUid($target, 'metadata-drag')
  setDragInfo('metadata-drag', [
    {
      type: 'text/plain',
      data: 'old payload',
    },
  ])
  const firstTransfer = new DataTransfer()
  dispatchDragStart($target, firstTransfer)

  dom = patchDom(
    $root,
    dom,
    [
      { type: VirtualDomElements.Div, childCount: 1 },
      {
        type: VirtualDomElements.Div,
        id: 'metadata-drag-target',
        draggable: true,
        onDragStart: 21,
        childCount: 1,
      },
      text('drag'),
    ],
    {},
    uid,
  )
  setDragInfo('metadata-drag', [
    {
      type: 'text/plain',
      data: 'fresh payload',
    },
  ])
  const secondTransfer = new DataTransfer()
  dispatchDragStart($target, secondTransfer)

  return {
    firstText: firstTransfer.getData('text/plain'),
    secondText: secondTransfer.getData('text/plain'),
  }
}

window.__virtualDomBroadDragDropClipboardResult = {
  dragInfo: runDragInfo(),
  dropAndClipboard: await runDropAndClipboard(),
  updatedDragMetadata: runUpdatedDragMetadata(),
}
window.__virtualDomDiffTestComplete = true
