import { test, expect } from '../src/fixtures.ts'

test('diff - sibling overrun does not navigate out of range while appending children', async ({
  page,
}) => {
  const siblingErrors: string[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (
        text.startsWith('Cannot navigate to sibling: sibling not found at index')
      ) {
        siblingErrors.push(text)
      }
    }
  })

  await page.goto('/diff/sibling-overrun.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container.locator('div').first()).toHaveText('ab')

  expect(siblingErrors).toHaveLength(0)
})
