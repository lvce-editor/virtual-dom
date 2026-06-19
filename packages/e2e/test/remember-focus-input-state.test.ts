import { test, expect } from '../src/fixtures.ts'

test('rememberFocus - preserves focused input state and layout styles', async ({
  page,
}) => {
  await page.goto('/diff/remember-focus-input-state.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomRememberFocusResult
  })

  expect(result.activeElementId).toBe('remembered-input')
  expect(result.value).toBe('typed query')
  expect(result.className).toBe('after-input')
  expect(result.placeholder).toBe('After')
  expect(result.statusText).toBe('after')
  expect(result.left).toBe('11px')
  expect(result.top).toBe('13px')
  expect(result.width).toBe('250px')
  expect(result.height).toBe('90px')
})
