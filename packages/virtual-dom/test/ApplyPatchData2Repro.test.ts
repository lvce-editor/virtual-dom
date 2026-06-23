/**
 * @jest-environment jsdom
 */
import { expect, test, jest } from '@jest/globals'
import * as ApplyPatch from '../src/parts/ApplyPatch/ApplyPatch.ts'
import { renderInto } from '../src/parts/VirtualDom/VirtualDom.ts'
import { initialNodes, replayPatches } from './fixtures/editorWorkerData2.ts'

test('replay data2 editor update reproduces sibling navigation failure', () => {
  const $Container = document.createElement('div')
  renderInto($Container, initialNodes)
  const $Root = $Container.firstChild as HTMLElement

  const consoleErrorSpy = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {})

  ApplyPatch.applyPatch($Root, replayPatches)

  expect(consoleErrorSpy).toHaveBeenCalledWith(
    expect.stringContaining(
      'Cannot navigate to sibling: sibling not found at index',
    ),
    expect.anything(),
  )
  consoleErrorSpy.mockRestore()
})
