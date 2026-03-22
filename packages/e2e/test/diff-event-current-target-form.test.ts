import { test, expect } from '../src/fixtures.ts'

test('diff - event.currentTarget supports form submit and nested paths', async ({
  page,
}) => {
  await page.goto('/diff/event-current-target-form.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const commands = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestCommands
  })

  expect(commands).toHaveLength(2)
  expect(commands[0].method).toBe('Viewlet.executeViewletCommand')
  expect(commands[0].args).toEqual([0, 'new-value'])
  expect(commands[1].method).toBe('Viewlet.executeViewletCommand')
  expect(commands[1].args).toEqual([0, '42', 'dataset-button', undefined])
})
