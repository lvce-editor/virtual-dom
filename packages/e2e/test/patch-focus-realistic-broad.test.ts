import { test, expect } from '../src/fixtures.ts'

test('broad patch focus and realistic flow e2e coverage', async ({ page }) => {
  await page.goto('/diff/patch-focus-realistic-broad.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const result = await page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomBroadPatchFocusRealisticResult
  })

  expect(result.referenceAndMixedPatchCases.afterInsert).toEqual([
    '',
    'before-ref',
    'REF',
    ' '.repeat(3),
    'B2',
  ])
  expect(result.referenceAndMixedPatchCases.afterRemove).toEqual(['REF', 'B3'])
  expect(result.referenceAndMixedPatchCases.referenceConnected).toBe(true)

  expect(result.reorderAndReplacementCases.afterReorder).toEqual({
    text: 'tailduplicatemiddle text updatedduplicate',
    classes: ['last', 'third', 'first'],
    nodeTypes: [1, 1, 3, 1],
  })
  expect(result.reorderAndReplacementCases.afterElementToText).toEqual({
    text: 'plain text replacement',
    nodeType: 3,
  })
  expect(result.reorderAndReplacementCases.afterTextToElement).toEqual({
    tagName: 'BUTTON',
    text: 'button again',
  })

  expect(
    result.emptyWhitespaceAndNestedRemoval.afterWhitespaceInsert,
  ).toMatchObject({
    childCount: 4,
    nodeValues: [null, '', ' '.repeat(3), null],
    text: `A${' '.repeat(3)}B`,
  })
  expect(result.emptyWhitespaceAndNestedRemoval.afterWhitespaceRemove).toEqual({
    childCount: 2,
    text: 'AB',
  })
  expect(result.emptyWhitespaceAndNestedRemoval.nestedRemoval).toEqual({
    listText: 'onefive',
    itemCount: 2,
    asideExists: false,
  })

  expect(result.sequentialDiffsNoStaleListeners).toEqual({
    calls: ['one', 'two', 'three'],
    buttonText: 'three',
    statusText: 'third',
  })

  expect(result.rememberFocusCases.rootTree).toEqual({
    activeElementId: 'root-tree',
    text: 'after',
  })
  expect(result.rememberFocusCases.nestedTree).toEqual({
    activeElementId: 'nested-tree',
    text: 'after',
  })
  expect(result.rememberFocusCases.inputParent).toEqual({
    activeElementId: 'remember-parent-input',
    value: 'preserved text',
    className: 'after-input',
    placeholder: 'After',
    parentId: 'new-input-parent',
    viewletText: '',
  })

  expect(result.realisticFlows.commandPalette).toEqual({
    activeDescendant: 'command-save',
    optionsText: 'Save FileOpen File',
    keyCommand: ['ArrowDown', 'save'],
  })
  expect(result.realisticFlows.fileExplorer).toEqual({
    activeElementId: 'file-tree',
    text: 'srcpackage.json',
    selectedClass: 'expanded selected',
    oldFileExists: false,
  })
  expect(result.realisticFlows.searchResults.value).toBe('typed search')
  expect(result.realisticFlows.searchResults.count).toBe(10)
  expect(result.realisticFlows.searchResults.text).toContain('after 9')
  expect(result.realisticFlows.settingsForm).toEqual({
    name: 'Ada',
    enabled: true,
    theme: 'dark',
    status: 'dirty',
  })
  expect(result.realisticFlows.editorTabs).toEqual({
    labels: ['c.ts', 'a.ts'],
    activeId: 'tab-c',
    focusedId: 'tab-c',
    closedExists: false,
  })
  expect(result.realisticFlows.notifications).toEqual({
    calls: ['close', 'action', 'close'],
    toastIds: ['toast-two', 'toast-three'],
    text: 'UpdatedOpenSyncedClose',
  })
})
