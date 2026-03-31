import { test, expect } from '../src/fixtures.ts'

test('diff - event.target.dataset resolves camel-cased data keys and missing values', async ({
  page,
}) => {
  await page.goto('/diff/event-target-dataset.html')

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
  expect(commands[0].args).toEqual([0, '7', 'open-file', '', undefined])
  expect(commands[1].method).toBe('Viewlet.executeViewletCommand')
  expect(commands[1].args).toEqual([
    0,
    undefined,
    undefined,
    undefined,
    undefined,
  ])
})
