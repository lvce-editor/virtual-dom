import { test, expect } from '../src/fixtures.ts'

test('diff - cleans up tracked pointer listeners', async ({ page }) => {
  await page.goto('/diff/pointer-tracking-lifecycle.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomPointerTrackingLifecycleResult
  })

  expect(result).toEqual({
    commands: [
      ['pointer-down'],
      ['pointer-move', 20],
      ['pointer-up', 30],
      ['pointer-down'],
      ['pointer-move', 50],
      ['pointer-up', 60],
    ],
    pointerCaptureIds: [7, 8],
  })
})
