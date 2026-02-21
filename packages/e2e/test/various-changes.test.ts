import { test, expect } from '../src/fixtures.ts'

test('diff - various changes', async ({ page }) => {
  await page.goto('/diff/various-changes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div class="Main"><div class="EditorGroup" style="width: 100%;"><div class="EditorGroupHeader" role="none"><div class="MainTabs" role="tablist"><div class="MainTab MainTabSelected" data-group-index="0" data-index="0" role="tab" title="memfs:///workspace/file1.ts"><img class="TabIcon" role="none" src="extensions/builtin.vscode-icons/icons/file_type_typescript.svg"><span class="TabTitle">file1.ts</span><button class="EditorTabCloseButton" data-group-index="0" data-index="0"><div class="MaskIcon MaskIconClose"></div></button></div></div></div><div class="EditorContainer"><button class="Editor"></button></div></div></div>',
  )
})
