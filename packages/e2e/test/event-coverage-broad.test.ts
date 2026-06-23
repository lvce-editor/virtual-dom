import { test, expect } from '../src/fixtures.ts'

test('broad event e2e coverage', async ({ page }) => {
  await page.goto('/diff/event-coverage-broad.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomBroadEventCoverageResult
  })

  expect(result.registeredEventArgs.inputArgs).toEqual([
    'c',
    'insertText',
    'abc',
  ])
  expect(result.registeredEventArgs.beforeInputArgs).toEqual([
    'x',
    'insertText',
    'draft',
  ])
  expect(result.registeredEventArgs.beforeInputDefaultPrevented).toBe(true)
  expect(result.registeredEventArgs.beforeInputDispatchResult).toBe(false)
  expect(result.registeredEventArgs.wheelArgs).toEqual([5, -9, 1])
  expect(result.registeredEventArgs.pointerArgs).toEqual([
    11,
    12,
    1,
    true,
    true,
    true,
  ])
  expect(result.registeredEventArgs.nestedClickArgs).toEqual([
    'SPAN',
    'child-class',
    'nested-current-target',
    'outer',
  ])
  expect(result.registeredEventArgs.scrollArgs).toEqual([33])

  expect(result.listenerOptions).toEqual([
    {
      id: 'capture-target',
      type: 'click',
      options: { capture: true },
    },
    {
      id: 'passive-target',
      type: 'wheel',
      options: { passive: true },
    },
  ])
  expect(result.listenerLifecycle).toEqual([
    'click-old',
    'down',
    'down',
    'click-new',
    'down',
  ])
})
