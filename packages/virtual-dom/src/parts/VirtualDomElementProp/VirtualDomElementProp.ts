import * as AttachEvent from '../AttachEvent/AttachEvent.ts'
import * as SetStyle from '../SetStyle/SetStyle.ts'

const removedAttributeProps = new Map([
  ['ariaActivedescendant', 'aria-activedescendant'],
  ['ariaControls', 'aria-controls'],
  ['ariaLabelledBy', 'aria-labelledby'],
  ['ariaOwns', 'aria-owns'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['inputType', 'type'],
])

const pixelStyleProps = new Set([
  'height',
  'left',
  'marginTop',
  'paddingLeft',
  'paddingRight',
  'top',
  'width',
])

const eventProps = new Set([
  'onBlur',
  'onChange',
  'onClick',
  'onContextMenu',
  'onBeforeInput',
  'onDblClick',
  'onDragEnd',
  'onDragEnter',
  'onDragLeave',
  'onDragOver',
  'onDragStart',
  'onDrop',
  'onFocus',
  'onFocusIn',
  'onFocusOut',
  'onInput',
  'onKeydown',
  'onKeyDown',
  'onKeyUp',
  'onMouseDown',
  'onMouseMove',
  'onMouseOut',
  'onMouseOver',
  'onMouseUp',
  'onPointerDown',
  'onPointerMove',
  'onPointerOut',
  'onPointerOver',
  'onScroll',
  'onSelectionChange',
  'onSubmit',
  'onWheel',
])

const setOptionalAttribute = (
  $Element: HTMLElement,
  attributeName: string,
  value: any,
): void => {
  if (value) {
    $Element.setAttribute(attributeName, value)
    return
  }
  $Element.removeAttribute(attributeName)
}

const setDimension = (
  $Element: HTMLElement,
  key: 'height' | 'width',
  value: any,
): void => {
  if ($Element instanceof HTMLImageElement) {
    $Element[key] = value
    return
  }
  $Element.style[key] = typeof value === 'number' ? `${value}px` : value
}

const setPixelStyle = (
  $Element: HTMLElement,
  key: string,
  value: any,
): void => {
  $Element.style[key] = typeof value === 'number' ? `${value}px` : value
}

const setEventProp = (
  $Element: HTMLElement,
  key: string,
  value: any,
  eventMap: any,
  newEventMap?: any,
): void => {
  if (!eventMap || !value) {
    return
  }
  const eventName = key.slice(2).toLowerCase()
  AttachEvent.attachEvent($Element, eventMap, eventName, value, newEventMap)
}

export const removeProp = ($Element: HTMLElement, key: string): void => {
  if (eventProps.has(key)) {
    const eventName = key.slice(2).toLowerCase()
    AttachEvent.detachEvent($Element, eventName)
    return
  }

  if (
    (key === 'height' || key === 'width') &&
    $Element instanceof HTMLImageElement
  ) {
    $Element.removeAttribute(key)
    return
  }

  if (pixelStyleProps.has(key)) {
    $Element.style[key] = ''
    return
  }

  const attributeName = removedAttributeProps.get(key) || key
  $Element.removeAttribute(attributeName)
}

export const setProp = (
  $Element: HTMLElement,
  key: string,
  value: any,
  eventMap: any,
  newEventMap?: any,
): void => {
  switch (key) {
    case 'ariaActivedescendant':
      setOptionalAttribute($Element, 'aria-activedescendant', value)
      return
    case 'ariaControls':
      $Element.setAttribute('aria-controls', value)
      return
    case 'ariaLabelledBy':
      $Element.setAttribute('aria-labelledby', value)
      return
    case 'ariaOwns':
      setOptionalAttribute($Element, 'aria-owns', value)
      return
  }

  if (key === 'height' || key === 'width') {
    setDimension($Element, key, value)
    return
  }

  if (key === 'id') {
    if (value) {
      $Element[key] = value
    } else {
      $Element.removeAttribute(key)
    }
    return
  }

  if (key === 'inputType') {
    // @ts-ignore
    $Element.type = value
    return
  }

  if (pixelStyleProps.has(key)) {
    setPixelStyle($Element, key, value)
    return
  }

  if (key === 'maskImage') {
    $Element.style.maskImage = `url('${value}')`
    $Element.style.webkitMaskImage = `url('${value}')`
    return
  }

  if (eventProps.has(key)) {
    setEventProp($Element, key, value, eventMap, newEventMap)
    return
  }

  if (key === 'style') {
    SetStyle.setStyle($Element, value)
    return
  }

  if (key === 'translate') {
    $Element.style[key] = value
    return
  }

  if (key.startsWith('data-')) {
    $Element.dataset[key.slice('data-'.length)] = value
    return
  }

  $Element[key] = value
}
