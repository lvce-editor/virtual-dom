import { expect, test } from '@jest/globals'
import * as VirtualDomElements from '../src/parts/VirtualDomElements/VirtualDomElements.ts'

test('h1', () => {
  expect(VirtualDomElements.H1).toBeDefined()
})
