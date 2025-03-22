import * as VirtualDomElementProp from '../VirtualDomElementProp/VirtualDomElementProp.ts'

export const setProps = ($Element, props, eventMap, newEventMap): void => {
  for (const key in props) {
    VirtualDomElementProp.setProp(
      $Element,
      key,
      props[key],
      eventMap,
      newEventMap,
    )
  }
}
