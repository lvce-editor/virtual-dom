import { test, expect } from '../src/fixtures.ts'

test('diff - extension search', async ({ page }) => {
  await page.goto('/diff/extension-search-results.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div aria-busy="false" aria-live="polite" class="Viewlet Extensions" role="none"><div class="ExtensionHeader"><div class="SearchField" role="none"><input autocapitalize="off" autocomplete="off" class="MultilineInputBox" type="search" name="extensions" placeholder="Search Extensions in Marketplace" spellcheck="false"><div class="SearchFieldButtons"><button class="SearchFieldButton" tabindex="0" title="Clear extension search results"><div class="MaskIcon MaskIconClearAll"></div></button><button class="SearchFieldButton" tabindex="0" title="Filter"><div class="MaskIcon MaskIconFilter"></div></button></div></div></div><div class="NoExtensionsFoundMessage">No extensions found.</div></div>',
  )
})
