import {
  createRenderer,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const renderer = createRenderer({ cache: { dom: 100, text: 100 } })
let clicks = 0
const first = renderer.render(
  [
    {
      type: VirtualDomElements.Div,
      childCount: 1,
      id: 'old',
      className: 'old',
      onClick: 'click',
    },
    { type: VirtualDomElements.Text, childCount: 0, text: 'Old text' },
  ],
  {},
  { click: () => clicks++ },
)
document.body.append(first)
const element = first.firstChild
const text = element.firstChild
element.click()
renderer.dispose(first)
const clearedText = text.data
const next = renderer.render([
  { type: VirtualDomElements.Div, childCount: 1 },
  { type: VirtualDomElements.Text, childCount: 0, text: 'New text' },
])
document.body.append(next)
next.firstChild.click()
window.recyclingResult = {
  reusedElement: next.firstChild === element,
  reusedText: next.firstChild.firstChild === text,
  clearedText,
  clicks,
  attributes: element.getAttributeNames(),
}
