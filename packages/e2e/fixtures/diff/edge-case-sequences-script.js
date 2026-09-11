import {
  applyPatch,
  renderInto,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

const flatten = (node) => {
  if (typeof node === 'string') {
    return [{ type: VirtualDomElements.Text, text: node, childCount: 0 }]
  }
  const { tag, props = {}, children = [] } = node
  return [
    { type: VirtualDomElements[tag], ...props, childCount: children.length },
    ...children.flatMap(flatten),
  ]
}

// Each invocation starts with a fresh page and uses the public renderer and diff API.
globalThis.runEdgeCaseSequence = ({ trees, read, setup }) => {
  const $mount = document.getElementById('diff-container')
  let oldDom = flatten(trees[0])
  renderInto($mount, oldDom)
  const $original = $mount.querySelector(read.selector)
  if (setup) {
    Object.assign($original, setup.properties)
    if (setup.focus) {
      $original.focus()
    }
    if (setup.selection) {
      $original.setSelectionRange(...setup.selection)
    }
  }

  const snapshot = () => {
    const $target = $mount.querySelector(read.selector)
    const result = { sameNode: $target === $original }
    for (const property of read.properties || []) {
      result[property] = property
        .split('.')
        .reduce((value, key) => value[key], $target)
    }
    for (const attribute of read.attributes || []) {
      result[attribute] = $target.getAttribute(attribute)
    }
    if (read.childNodes) {
      result.childNodes = Array.from($target.childNodes, (node) => ({
        type: node.nodeType,
        value: node.nodeValue,
      }))
    }
    if (read.focus) {
      result.focused = document.activeElement === $target
    }
    return result
  }

  const snapshots = [snapshot()]
  for (const tree of trees.slice(1)) {
    const newDom = flatten(tree)
    applyPatch($mount.firstChild, diffTree(oldDom, newDom))
    oldDom = newDom
    snapshots.push(snapshot())
  }
  return snapshots
}
