import { applyDiff, text } from './broad-test-helpers.js'
import { VirtualDomElements } from '/dist/virtual-dom/dist/index.js'

const $container = document.getElementById('diff-container')

const createDom = (version) => {
  const isAfter = version === 'after'
  return [
    {
      type: VirtualDomElements.Table,
      id: 'sectioned-table',
      childCount: 4,
    },
    {
      type: VirtualDomElements.ColGroup,
      id: 'sectioned-table-columns',
      childCount: 2,
    },
    {
      type: VirtualDomElements.Col,
      width: isAfter ? 160 : 120,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Col,
      width: isAfter ? 90 : 80,
      childCount: 0,
    },
    {
      type: VirtualDomElements.THead,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Tr,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Th,
      scope: 'col',
      childCount: 1,
    },
    text(isAfter ? 'Package' : 'Name'),
    {
      type: VirtualDomElements.Th,
      scope: 'col',
      childCount: 1,
    },
    text(isAfter ? 'Tests' : 'Count'),
    {
      type: VirtualDomElements.TBody,
      id: 'sectioned-table-body',
      childCount: isAfter ? 3 : 2,
    },
    {
      type: VirtualDomElements.Tr,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Td,
      childCount: 1,
    },
    text('virtual-dom'),
    {
      type: VirtualDomElements.Td,
      childCount: 1,
    },
    text(isAfter ? '120' : '110'),
    {
      type: VirtualDomElements.Tr,
      childCount: 2,
    },
    {
      type: VirtualDomElements.Td,
      rowSpan: isAfter ? 2 : 1,
      childCount: 1,
    },
    text('virtual-dom-worker'),
    {
      type: VirtualDomElements.Td,
      childCount: 1,
    },
    text(isAfter ? '85' : '80'),
    ...(isAfter
      ? [
          {
            type: VirtualDomElements.Tr,
            childCount: 1,
          },
          {
            type: VirtualDomElements.Td,
            childCount: 1,
          },
          text('browser coverage'),
        ]
      : []),
    {
      type: VirtualDomElements.Tfoot,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Tr,
      childCount: 1,
    },
    {
      type: VirtualDomElements.Td,
      colSpan: 2,
      childCount: 1,
    },
    text(isAfter ? 'Total 205' : 'Total 190'),
  ]
}

applyDiff($container, createDom('before'), createDom('after'))

window.__virtualDomDiffTestComplete = true
