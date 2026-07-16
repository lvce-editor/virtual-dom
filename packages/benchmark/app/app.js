import {
  applyPatch,
  renderInto,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const adjectives = [
  'pretty',
  'large',
  'big',
  'small',
  'tall',
  'short',
  'long',
  'handsome',
  'plain',
  'quaint',
  'clean',
  'elegant',
  'easy',
  'angry',
  'crazy',
  'helpful',
  'mushy',
  'odd',
  'unsightly',
  'adorable',
  'important',
  'inexpensive',
  'cheap',
  'expensive',
  'fancy',
]
const colours = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
]
const nouns = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
]

const scenarioNames = new Map([
  ['create-1k', 'Create 1,000 rows'],
  ['replace-1k', 'Replace all rows'],
  ['partial-update', 'Update every 10th row'],
  ['select-row', 'Select row'],
  ['swap-rows', 'Swap rows'],
  ['remove-row', 'Remove row'],
  ['create-10k', 'Create 10,000 rows'],
  ['append-1k', 'Append 1,000 rows'],
  ['clear-1k', 'Clear rows'],
])

const $root = document.querySelector('#benchmark-root')
const $status = document.querySelector('#status')
const $toolbar = document.querySelector('#toolbar')

let rows = []
let selectedId = -1
let currentDom
let scenarioContext = {}

const makeLabel = (id) => {
  return `${adjectives[id % adjectives.length]} ${
    colours[(id * 7) % colours.length]
  } ${nouns[(id * 13) % nouns.length]}`
}

const makeRows = (count, start = 1) => {
  return Array.from({ length: count }, (_, index) => {
    const id = start + index
    return {
      id,
      label: makeLabel(id),
    }
  })
}

const createRowDom = (row) => {
  const className = row.id === selectedId ? 'danger' : ''
  return [
    {
      childCount: 4,
      className,
      key: row.id,
      type: VirtualDomElements.Tr,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Td,
    },
    {
      childCount: 0,
      text: String(row.id),
      type: VirtualDomElements.Text,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Td,
    },
    {
      childCount: 1,
      className: 'row-label',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      text: row.label,
      type: VirtualDomElements.Text,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Td,
    },
    {
      childCount: 1,
      className: 'remove-icon',
      type: VirtualDomElements.Span,
    },
    {
      childCount: 0,
      text: '×',
      type: VirtualDomElements.Text,
    },
    {
      childCount: 0,
      type: VirtualDomElements.Td,
    },
  ]
}

const createDom = () => {
  const dom = [
    {
      childCount: 1,
      className: 'benchmark-table',
      type: VirtualDomElements.Table,
    },
    {
      childCount: rows.length,
      type: VirtualDomElements.TBody,
    },
  ]
  for (const row of rows) {
    dom.push(...createRowDom(row))
  }
  return dom
}

const render = () => {
  const nextDom = createDom()
  if (!currentDom) {
    renderInto($root, nextDom)
  } else {
    const patches = diffTree(currentDom, nextDom)
    applyPatch($root.firstElementChild, patches)
  }
  currentDom = nextDom
}

const forceLayout = () => {
  $root.firstElementChild?.getBoundingClientRect()
}

const reset = (id) => {
  selectedId = -1
  scenarioContext = {}
  switch (id) {
    case 'create-1k':
    case 'create-10k':
      rows = []
      break
    case 'append-1k':
      rows = makeRows(1_000)
      break
    default:
      rows = makeRows(1_000)
      break
  }
  render()
}

const perform = (id) => {
  switch (id) {
    case 'create-1k':
      rows = makeRows(1_000)
      break
    case 'replace-1k':
      rows = makeRows(1_000, 100_001)
      break
    case 'partial-update':
      rows = rows.map((row, index) => {
        return index % 10 === 0 ? { ...row, label: `${row.label} !!!` } : row
      })
      break
    case 'select-row':
      selectedId = rows[1].id
      scenarioContext.selectedId = selectedId
      break
    case 'swap-rows': {
      const nextRows = [...rows]
      scenarioContext.firstId = rows[1].id
      scenarioContext.secondId = rows[998].id
      ;[nextRows[1], nextRows[998]] = [nextRows[998], nextRows[1]]
      rows = nextRows
      break
    }
    case 'remove-row':
      scenarioContext.removedId = rows[1].id
      rows = [...rows.slice(0, 1), ...rows.slice(2)]
      break
    case 'create-10k':
      rows = makeRows(10_000)
      break
    case 'append-1k':
      rows = [...rows, ...makeRows(1_000, 100_001)]
      break
    case 'clear-1k':
      rows = []
      break
    default:
      throw new Error(`Unknown benchmark scenario: ${id}`)
  }
  render()
}

const verify = (id) => {
  const $rows = $root.querySelectorAll('tbody > tr')
  switch (id) {
    case 'create-1k':
    case 'replace-1k':
      return $rows.length === 1_000
    case 'partial-update':
      return (
        $rows.length === 1_000 &&
        $rows[0].querySelector('.row-label').textContent.endsWith(' !!!')
      )
    case 'select-row':
      return (
        $rows.length === 1_000 &&
        $root.querySelectorAll('tr.danger').length === 1 &&
        rows[1].id === scenarioContext.selectedId
      )
    case 'swap-rows':
      return (
        $rows.length === 1_000 &&
        rows[1].id === scenarioContext.secondId &&
        rows[998].id === scenarioContext.firstId
      )
    case 'remove-row':
      return (
        $rows.length === 999 &&
        !rows.some((row) => row.id === scenarioContext.removedId)
      )
    case 'create-10k':
      return $rows.length === 10_000
    case 'append-1k':
      return $rows.length === 2_000
    case 'clear-1k':
      return $rows.length === 0
    default:
      return false
  }
}

const run = (id) => {
  const start = performance.now()
  perform(id)
  forceLayout()
  const duration = performance.now() - start
  if (!verify(id)) {
    throw new Error(`Benchmark verification failed: ${id}`)
  }
  return duration
}

for (const [id, name] of scenarioNames) {
  const $button = document.createElement('button')
  $button.textContent = name
  $button.addEventListener('click', () => {
    reset(id)
    const duration = run(id)
    $status.textContent = `${name}: ${duration.toFixed(2)} ms`
  })
  $toolbar.append($button)
}

reset('create-1k')
globalThis.virtualDomBenchmark = {
  reset,
  run,
}
