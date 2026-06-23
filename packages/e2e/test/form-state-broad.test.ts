import { test, expect } from '../src/fixtures.ts'

test('broad form state e2e coverage', async ({ page }) => {
  await page.goto('/diff/form-state-broad.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomBroadFormStateResult
  })

  expect(result.checkboxUserState).toEqual({
    checked: true,
    statusText: 'after',
  })
  expect(result.checkedValueUpdates).toEqual({
    checkboxChecked: true,
    radioAChecked: false,
    radioBChecked: true,
  })
  expect(result.radioUserState).toEqual({
    lightChecked: false,
    darkChecked: true,
    statusText: 'after',
  })
  expect(result.textareaState.activeElementId).toBe('notes-textarea')
  expect(result.textareaState.value).toBe(
    'line 1\nline 2\nline 3\nline 4\nline 5',
  )
  expect(result.textareaState.selectionStart).toBe(7)
  expect(result.textareaState.selectionEnd).toBe(13)
  expect(result.textareaState.scrollTop).toBeGreaterThan(0)
  expect(result.textareaState.statusText).toBe('after')
  expect(result.selectPreserve).toEqual({
    value: 'uk',
    optionValues: ['us', 'uk', 'ca'],
    firstOptionText: 'United States updated',
    statusText: 'updated',
  })
  expect(result.selectRemoval.value).toBe('us')
  expect(result.selectRemoval.selectedIndex).toBe(0)
  expect(result.selectRemoval.optionValues).toEqual(['us', 'uk'])
  expect(result.inputTypeChange).toEqual({
    type: 'password',
    value: 'secret',
    typeAttribute: 'password',
  })
  expect(result.formSubmit.dispatchResult).toBe(false)
  expect(result.formSubmit.defaultPrevented).toBe(true)
  expect(result.formSubmit.command.method).toBe('Viewlet.executeViewletCommand')
  expect(result.formSubmit.command.args).toEqual([
    0,
    'broad-form',
    'primary',
    'typed value',
  ])
})
