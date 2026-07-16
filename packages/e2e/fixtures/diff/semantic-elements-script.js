import { applyDiff, text } from './broad-test-helpers.js'
import { VirtualDomElements } from '/dist/virtual-dom/dist/index.js'

const $container = document.getElementById('diff-container')

const createDom = (version) => [
  {
    type: VirtualDomElements.Div,
    id: 'semantic-root',
    childCount: 10,
  },
  { type: VirtualDomElements.H3, childCount: 1 },
  text(`Heading 3 ${version}`),
  { type: VirtualDomElements.H4, childCount: 1 },
  text(`Heading 4 ${version}`),
  { type: VirtualDomElements.H5, childCount: 1 },
  text(`Heading 5 ${version}`),
  { type: VirtualDomElements.H6, childCount: 1 },
  text(`Heading 6 ${version}`),
  {
    type: VirtualDomElements.Figure,
    id: 'semantic-figure',
    childCount: 2,
  },
  {
    type: VirtualDomElements.Img,
    id: 'semantic-image',
    alt: `Diagram ${version}`,
    width: version === 'before' ? 16 : 32,
    height: version === 'before' ? 12 : 24,
    childCount: 0,
  },
  { type: VirtualDomElements.Figcaption, childCount: 1 },
  text(`Figure caption ${version}`),
  {
    type: VirtualDomElements.Dl,
    id: 'semantic-description-list',
    childCount: 4,
  },
  { type: VirtualDomElements.Dt, childCount: 1 },
  text('Runtime'),
  { type: VirtualDomElements.Dd, childCount: 1 },
  text(version === 'before' ? 'Browser' : 'Chromium'),
  { type: VirtualDomElements.Dt, childCount: 1 },
  text('Status'),
  { type: VirtualDomElements.Dd, childCount: 1 },
  text(version === 'before' ? 'Draft' : 'Ready'),
  {
    type: VirtualDomElements.Ol,
    id: 'semantic-ordered-list',
    childCount: 2,
  },
  { type: VirtualDomElements.Li, childCount: 1 },
  text(version === 'before' ? 'Inspect' : 'Render'),
  { type: VirtualDomElements.Li, childCount: 1 },
  text(version === 'before' ? 'Render' : 'Verify'),
  {
    type: VirtualDomElements.P,
    id: 'semantic-inline-elements',
    childCount: 9,
  },
  {
    type: VirtualDomElements.Cite,
    title: `Citation ${version}`,
    childCount: 1,
  },
  text(`Cite ${version}`),
  { type: VirtualDomElements.Code, childCount: 1 },
  text(`code-${version}`),
  {
    type: VirtualDomElements.Data,
    value: version === 'before' ? '1' : '2',
    childCount: 1,
  },
  text(`Data ${version}`),
  {
    type: VirtualDomElements.Del,
    dateTime: version === 'before' ? '2026-07-15' : '2026-07-16',
    childCount: 1,
  },
  text(`Deleted ${version}`),
  { type: VirtualDomElements.I, childCount: 1 },
  text(`Italic ${version}`),
  {
    type: VirtualDomElements.Ins,
    dateTime: version === 'before' ? '2026-07-15' : '2026-07-16',
    childCount: 1,
  },
  text(`Inserted ${version}`),
  { type: VirtualDomElements.Kbd, childCount: 1 },
  text(version === 'before' ? 'Ctrl' : 'Enter'),
  {
    type: VirtualDomElements.Time,
    dateTime: version === 'before' ? '09:00' : '10:30',
    childCount: 1,
  },
  text(version === 'before' ? '9:00' : '10:30'),
  { type: VirtualDomElements.Br, childCount: 0 },
  {
    type: VirtualDomElements.Search,
    id: 'semantic-search',
    childCount: 1,
  },
  {
    type: VirtualDomElements.Input,
    inputType: 'search',
    name: 'semantic-query',
    placeholder: `Search ${version}`,
    value: version,
    childCount: 0,
  },
  { type: VirtualDomElements.Hr, id: 'semantic-separator', childCount: 0 },
]

applyDiff($container, createDom('before'), createDom('after'))

window.__virtualDomDiffTestComplete = true
