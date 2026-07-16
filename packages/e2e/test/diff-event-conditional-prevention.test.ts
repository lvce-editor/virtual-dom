import { test, expect } from '../src/fixtures.ts'

test('diff - conditionally prevents defaults and stops propagation', async ({
  page,
}) => {
  await page.goto('/diff/event-conditional-prevention.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomConditionalPreventionResult
  })

  expect(result).toEqual({
    commands: [['div'], ['input']],
    divDefaultPrevented: true,
    divDispatchResult: false,
    inputDefaultPrevented: false,
    inputDispatchResult: true,
  })
})
