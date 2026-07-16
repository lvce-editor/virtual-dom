import { test, expect } from '../src/fixtures.ts'

test('pointer tracking removes transient listeners after pointerup or lostpointercapture', async ({
  page,
}) => {
  await page.goto('/diff/pointer-track-cleanup.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomPointerTrackCleanupResult
  })

  expect(result.pointerUp.addedListeners).toEqual([
    'pointerdown',
    'pointermove',
    'pointerup',
    'lostpointercapture',
  ])
  expect(result.pointerUp.removedListeners).toEqual([
    'pointermove',
    'pointerup',
    'lostpointercapture',
  ])
  expect(result.pointerUp.commandNames).toEqual([
    'handlePointerDown',
    'handlePointerMove',
    'handlePointerUp',
  ])

  expect(result.lostPointerCapture.addedListeners).toEqual([
    'pointerdown',
    'pointermove',
    'pointerup',
    'lostpointercapture',
  ])
  expect(result.lostPointerCapture.removedListeners).toEqual([
    'pointermove',
    'pointerup',
    'lostpointercapture',
  ])
  expect(result.lostPointerCapture.commandNames).toEqual([
    'handlePointerDown',
    'handlePointerMove',
    'handlePointerUp',
  ])
})
