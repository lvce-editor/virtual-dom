import { VirtualDomElements } from '@lvce-editor/constants'
import { applyDiff, text } from './broad-test-helpers.js'

const $container = document.getElementById('diff-container')

const createDom = (version) => {
  const isAfter = version === 'after'
  return [
    {
      type: VirtualDomElements.Main,
      id: 'additional-elements-root',
      childCount: 4,
    },
    {
      type: VirtualDomElements.P,
      id: 'additional-inline-elements',
      childCount: 4,
    },
    text(isAfter ? 'Updated text with ' : 'Text with '),
    {
      type: VirtualDomElements.Strong,
      childCount: 1,
    },
    text(isAfter ? 'strong updates' : 'strong text'),
    text(' and '),
    {
      type: VirtualDomElements.Em,
      childCount: 1,
    },
    text(isAfter ? 'emphasized updates' : 'emphasized text'),
    {
      type: VirtualDomElements.BlockQuote,
      id: 'additional-blockquote',
      cite: isAfter ? '/after-source' : '/before-source',
      childCount: 1,
    },
    text(isAfter ? 'After quotation' : 'Before quotation'),
    {
      type: VirtualDomElements.Canvas,
      id: 'additional-canvas',
      width: isAfter ? 320 : 160,
      height: isAfter ? 180 : 90,
      childCount: 0,
    },
    {
      type: VirtualDomElements.Iframe,
      id: 'additional-iframe',
      title: isAfter ? 'Updated preview' : 'Preview',
      srcdoc: isAfter
        ? '<p id="frame-content">after</p>'
        : '<p id="frame-content">before</p>',
      childCount: 0,
    },
  ]
}

applyDiff($container, createDom('before'), createDom('after'))

window.__virtualDomDiffTestComplete = true
