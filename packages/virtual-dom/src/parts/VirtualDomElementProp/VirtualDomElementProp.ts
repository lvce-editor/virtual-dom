import * as AttachEvent from '../AttachEvent/AttachEvent.ts'
import * as SetStyle from '../SetStyle/SetStyle.ts'

export const setProp = (
  $Element: HTMLElement,
  key: string,
  value: any,
  eventMap: any,
  newEventMap?: any,
): void => {
  switch (key) {
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
    case 'ariaLabelledBy':
      $Element.setAttribute('aria-labelledby', value)
      break
    case 'ariaOwns': // TODO remove this once idl is supported
      if (value) {
        $Element.setAttribute('aria-owns', value)
      } else {
        $Element.removeAttribute('aria-owns')
      }
      break
    case 'childCount':
    case 'type':
      break
    case 'height':
    case 'width':
      if ($Element instanceof HTMLImageElement) {
        $Element[key] = value
      } else if (typeof value === 'number') {
        $Element.style[key] = `${value}px`
      } else {
        $Element.style[key] = value
      }
      break
    case 'id':
      if (value) {
        $Element[key] = value
      } else {
        $Element.removeAttribute(key)
      }
      break
    case 'inputType':
      // @ts-ignore
      $Element.type = value
      break
    case 'left':
    case 'marginTop':
    case 'paddingLeft':
    case 'paddingRight':
    case 'top':
      $Element.style[key] = typeof value === 'number' ? `${value}px` : value
      break
    case 'maskImage':
      $Element.style.maskImage = `url('${value}')`
      $Element.style.webkitMaskImage = `url('${value}')`
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
    case 'onKeydown':
    case 'onKeyDown':
    case 'onMouseDown':
    case 'onMouseMove':
    case 'onMouseOut':
    case 'onMouseOver':
    case 'onPointerDown':
    case 'onPointerMove':
    case 'onPointerOut':
    case 'onPointerOver':
    case 'onScroll':
    case 'onSelectionChange':
    case 'onWheel':
      const eventName = key.slice(2).toLowerCase()
      if (!eventMap || !value) {
        return
      }
      AttachEvent.attachEvent($Element, eventMap, eventName, value, newEventMap)
      break
    case 'style':
      SetStyle.setStyle($Element, value)
      break
    case 'translate':
      $Element.style[key] = value
      break
    default:
      if (key.startsWith('data-')) {
        $Element.dataset[key.slice('data-'.length)] = value
      } else {
        $Element[key] = value
      }
  }
}
