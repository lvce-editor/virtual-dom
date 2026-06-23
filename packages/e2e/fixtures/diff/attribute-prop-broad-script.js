import {
  applyDiff,
  createCaseRoot,
  patchDom,
  text,
} from './broad-test-helpers.js'
import {
  renderInto,
  VirtualDomElements,
} from '/dist/virtual-dom/dist/index.js'

const runHtmlFor = () => {
  const $mount = createCaseRoot('html-for-case')
  let dom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Label,
      id: 'broad-label',
      htmlFor: 'before-input',
      childCount: 1,
    },
    text('Name'),
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Label,
      id: 'broad-label',
      htmlFor: 'after-input',
      childCount: 1,
    },
    text('Name'),
  ])
  const afterUpdate = document.getElementById('broad-label').getAttribute('for')
  patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Label,
      id: 'broad-label',
      childCount: 1,
    },
    text('Name'),
  ])
  return {
    afterUpdate,
    afterRemove: document.getElementById('broad-label').getAttribute('for'),
  }
}

const runAriaAttributes = () => {
  const $mount = createCaseRoot('aria-attributes-broad-case')
  let dom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'aria-broad-target',
      ariaActivedescendant: 'item-1',
      ariaOwns: 'list-1',
      ariaControls: 'panel-1',
      ariaLabelledBy: 'label-1',
      childCount: 0,
    },
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'aria-broad-target',
      ariaActivedescendant: '',
      ariaOwns: '',
      ariaControls: 'panel-2',
      ariaLabelledBy: 'label-2',
      childCount: 0,
    },
  ])
  const $target = document.getElementById('aria-broad-target')
  const afterOptionalRemoval = {
    active: $target.getAttribute('aria-activedescendant'),
    owns: $target.getAttribute('aria-owns'),
    controls: $target.getAttribute('aria-controls'),
    labelledBy: $target.getAttribute('aria-labelledby'),
  }
  patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'aria-broad-target',
      childCount: 0,
    },
  ])
  return {
    afterOptionalRemoval,
    afterMappedRemoval: {
      controls: $target.getAttribute('aria-controls'),
      labelledBy: $target.getAttribute('aria-labelledby'),
    },
  }
}

const runIdClassData = () => {
  const $mount = createCaseRoot('id-class-data-case')
  let dom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'identity-before',
      className: 'before-class',
      'data-one': '1',
      'data-two': '2',
      childCount: 0,
    },
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      id: 'identity-after',
      className: 'after-class',
      'data-one': '10',
      childCount: 0,
    },
  ])
  const $target = document.getElementById('identity-after')
  const afterUpdate = {
    id: $target.id,
    className: $target.className,
    dataOne: $target.dataset.one,
    dataTwo: $target.dataset.two,
    dataTwoAttribute: $target.getAttribute('data-two'),
  }
  patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Div,
      childCount: 0,
    },
  ])
  return {
    afterUpdate,
    afterRemove: {
      id: $target.getAttribute('id'),
      className: $target.getAttribute('class'),
      dataOne: $target.getAttribute('data-one'),
    },
  }
}

const runBooleanishProps = () => {
  const $mount = createCaseRoot('booleanish-case')
  const initialDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Button,
      id: 'booleanish-button',
      disabled: true,
      hidden: true,
      draggable: true,
      contentEditable: 'true',
      childCount: 1,
    },
    text('Button'),
  ]
  const updatedDom = [
    { type: VirtualDomElements.Div, childCount: 1 },
    {
      type: VirtualDomElements.Button,
      id: 'booleanish-button',
      disabled: false,
      hidden: false,
      draggable: false,
      contentEditable: 'false',
      childCount: 1,
    },
    text('Button'),
  ]
  applyDiff($mount, initialDom, updatedDom)
  const $button = document.getElementById('booleanish-button')
  return {
    disabled: $button.disabled,
    hidden: $button.hidden,
    draggable: $button.draggable,
    contentEditable: $button.contentEditable,
  }
}

const runStyleAndDimensionProps = () => {
  const $mount = createCaseRoot('style-dimension-case')
  let dom = [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Div,
      id: 'style-prop-target',
      width: 10,
      height: 20,
      top: 1,
      left: 2,
      marginTop: 3,
      paddingLeft: 4,
      paddingRight: 5,
      translate: '1px 2px',
      maskImage: 'before.svg',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Img,
      id: 'dimension-image',
      width: 12,
      height: 13,
      childCount: 0,
    },
  ]
  renderInto($mount, dom)
  const $root = $mount.firstElementChild
  dom = patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Div,
      id: 'style-prop-target',
      width: 30,
      height: 40,
      top: 8,
      left: 9,
      marginTop: 10,
      paddingLeft: 11,
      paddingRight: 12,
      translate: '3px 4px',
      maskImage: 'after.svg',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Img,
      id: 'dimension-image',
      width: 22,
      height: 23,
      childCount: 0,
    },
  ])
  const $target = document.getElementById('style-prop-target')
  const $image = document.getElementById('dimension-image')
  const afterUpdate = {
    width: $target.style.width,
    height: $target.style.height,
    top: $target.style.top,
    left: $target.style.left,
    marginTop: $target.style.marginTop,
    paddingLeft: $target.style.paddingLeft,
    paddingRight: $target.style.paddingRight,
    translate: $target.style.translate,
    maskImage: $target.style.maskImage,
    webkitMaskImage: $target.style.webkitMaskImage,
    imageWidth: $image.width,
    imageHeight: $image.height,
  }
  patchDom($root, dom, [
    { type: VirtualDomElements.Div, childCount: 2 },
    {
      type: VirtualDomElements.Div,
      id: 'style-prop-target',
      translate: '5px 6px',
      maskImage: 'after.svg',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Img,
      id: 'dimension-image',
      childCount: 0,
    },
  ])
  return {
    afterUpdate,
    afterPixelRemoval: {
      width: $target.style.width,
      height: $target.style.height,
      top: $target.style.top,
      left: $target.style.left,
      marginTop: $target.style.marginTop,
      paddingLeft: $target.style.paddingLeft,
      paddingRight: $target.style.paddingRight,
      translate: $target.style.translate,
      imageWidthAttribute: $image.getAttribute('width'),
      imageHeightAttribute: $image.getAttribute('height'),
    },
  }
}

window.__virtualDomBroadAttributePropResult = {
  htmlFor: runHtmlFor(),
  ariaAttributes: runAriaAttributes(),
  idClassData: runIdClassData(),
  booleanishProps: runBooleanishProps(),
  styleAndDimensionProps: runStyleAndDimensionProps(),
}
window.__virtualDomDiffTestComplete = true
