import { test, expect } from '../src/fixtures.ts'

test('diff - text node split', async ({ page }) => {
  await page.goto('/diff/text-node-split.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()

  // The expected output should have text nodes, not divs
  // Expected: <td class="TableCell"><span class="SearchHighlight">Abo</span>ut</td>
  expect(innerHTML).toBe(
    `<td class="TableCell"><span class="SearchHighlight">Abo</span>ut</td>`,
  )
})
