import { test, expect } from '../src/fixtures.ts'

test('diff - event preventDefault honors listener options', async ({ page }) => {
  await page.goto('/diff/event-prevent-default-options.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomPreventDefaultResult
  })

  expect(result.clickDispatchResult).toBe(false)
  expect(result.clickDefaultPrevented).toBe(true)
  expect(result.wheelDispatchResult).toBe(true)
  expect(result.wheelDefaultPrevented).toBe(false)
  expect(result.wheelListenerOptions).toEqual({ passive: true })
})
