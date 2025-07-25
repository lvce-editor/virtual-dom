import * as AttachEvent from '../AttachEvent/AttachEvent.ts'

export const setProp = (
  $Element: HTMLElement,
  key: string,
  value: any,
  eventMap: any,
  newEventMap?: any,
): void => {
  switch (key) {
    case 'maskImage':
      $Element.style.maskImage = `url('${value}')`
      $Element.style.webkitMaskImage = `url('${value}')`
      break
    case 'paddingLeft':
    case 'paddingRight':
    case 'top':
    case 'left':
    case 'marginTop':
      $Element.style[key] = typeof value === 'number' ? `${value}px` : value
      break
    case 'translate':
      $Element.style[key] = value
      break
    case 'width':
    case 'height':
      if ($Element instanceof HTMLImageElement) {
        $Element[key] = value
      } else if (typeof value === 'number') {
        $Element.style[key] = `${value}px`
      } else {
        $Element.style[key] = value
      }
      break
    case 'style':
      throw new Error('style property is not supported')
    case 'childCount':
    case 'type':
      break
    case 'ariaOwns': // TODO remove this once idl is supported
      if (value) {
        $Element.setAttribute('aria-owns', value)
      } else {
        $Element.removeAttribute('aria-owns')
      }
      break
    case 'ariaActivedescendant':
      if (value) {
        $Element.setAttribute('aria-activedescendant', value)
      } else {
        $Element.removeAttribute('aria-activedescendant')
      }
      break
    case 'ariaControls':
      $Element.setAttribute('aria-controls', value)
      break
    case 'inputType':
      // @ts-ignore
      $Element.type = value
      break
    case 'ariaLabelledBy':
      $Element.setAttribute('aria-labelledby', value)
      break
    case 'onBlur':
    case 'onChange':
    case 'onClick':
    case 'onContextMenu':
    case 'onDblClick':
    case 'onDragEnd':
    case 'onDragEnter':
    case 'onDragLeave':
    case 'onDragOver':
    case 'onDragStart':
    case 'onDrop':
    case 'onFocus':
    case 'onFocusIn':
    case 'onFocusOut':
    case 'onInput':
    case 'onKeyDown':
    case 'onMouseDown':
    case 'onMouseOut':
    case 'onMouseOver':
    case 'onPointerDown':
    case 'onPointerMove':
    case 'onPointerOut':
    case 'onPointerOver':
    case 'onScroll':
    case 'onWheel':
      const eventName = key.slice(2).toLowerCase()
      if (!eventMap || !value) {
        return
      }
      AttachEvent.attachEvent($Element, eventMap, eventName, value, newEventMap)
      break
    case 'id':
      if (value) {
        $Element[key] = value
      } else {
        $Element.removeAttribute(key)
      }
      break
    default:
      if (key.startsWith('data-')) {
        $Element.dataset[key.slice('data-'.length)] = value
      } else {
        $Element[key] = value
      }
  }
}
