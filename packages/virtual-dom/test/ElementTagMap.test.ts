import { expect, test } from '@jest/globals'
import * as ElementTagMap from '../src/parts/ElementTagMap/ElementTagMap.ts'
import * as ElementTags from '../src/parts/ElementTags/ElementTags.ts'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('audio', () => {
  expect(ElementTagMap.getElementTag(VirtualDomElements.Audio)).toBe(
    ElementTags.Audio,
  )
})
