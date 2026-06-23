import {
  applyPatch,
  renderInto,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'
import { diffTree } from '/dist/virtual-dom-worker/dist/index.js'

export const Form = 78

export const text = (value) => ({
  type: VirtualDomElements.Text,
  text: value,
  childCount: 0,
})

export const createCaseRoot = (id) => {
  const $root = document.createElement('section')
  $root.id = id
  document.getElementById('diff-container').append($root)
  return $root
}

export const applyDiff = (
  $mount,
  initialDom,
  updatedDom,
  eventMap = {},
  uid = 0,
) => {
  renderInto($mount, initialDom, eventMap)
  const patches = diffTree(initialDom, updatedDom)
  const $root = $mount.firstElementChild
  applyPatch($root, patches, eventMap, uid)
  return $root
}

export const patchDom = ($root, oldDom, newDom, eventMap = {}, uid = 0) => {
  const patches = diffTree(oldDom, newDom)
  applyPatch($root, patches, eventMap, uid)
  return newDom
}

export const optionValues = ($select) =>
  Array.from($select.options, (option) => option.value)
