import { expect, test } from '../src/fixtures.ts'

test('diff - remove and reinsert activity bar item', async ({ page }) => {
  await page.goto('/diff/activity-bar-item-removal.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomActivityBarResult
  })

  expect(result).toEqual({
    afterRemoval: {
      accountCount: 1,
      extensionsCount: 0,
      itemCount: 6,
      rootPreserved: true,
      settingsCount: 1,
    },
    afterReinsertion: {
      accountCount: 1,
      extensionsCount: 1,
      itemCount: 7,
      rootPreserved: true,
      settingsCount: 1,
    },
  })
})
