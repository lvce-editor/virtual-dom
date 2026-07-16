import { test, expect } from '../src/fixtures.ts'

const expectedCalls = [
  'focus',
  'focusin',
  'focusout',
  'blur',
  'keyup',
  'selectionchange',
  'mouseover',
  'mouseout',
  'mouseup',
  'contextmenu',
  'pointermove',
  'pointerover',
  'pointerout',
  'dragenter',
  'dragover',
  'dragleave',
  'dragend',
]

test('diff - additional event types attach and detach', async ({ page }) => {
  await page.goto('/diff/additional-event-types.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomAdditionalEventTypesResult
  })

  expect(result.afterAttach).toEqual(expectedCalls)
  expect(result.afterRemoval).toEqual(expectedCalls)
})
