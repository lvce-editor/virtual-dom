import type { Page } from '@playwright/test'
import { test, expect } from '../src/fixtures.ts'

const openCase = async (page: Page, caseName: string): Promise<any> => {
  await page.goto(`/diff/error-boundary-cases.html#${caseName}`)
  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })
  return page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomErrorBoundaryResult
  })
}

const expectStableNavigationFailure = (result: any, message: string): void => {
  expect(result.html).toBe('<div><span>stable</span></div>')
  expect(result.rootId).toBe('')
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain(message)
}

test('apply patch - rejects a negative child index without mutating DOM', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-child-negative')
  expectStableNavigationFailure(result, 'Cannot navigate to child')
})

test('apply patch - rejects a child index beyond the child list', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-child-too-large')
  expectStableNavigationFailure(result, 'Cannot navigate to child')
})

test('apply patch - rejects the end child index when no insert follows', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-child-at-end-without-insert')
  expectStableNavigationFailure(result, 'Cannot navigate to child')
})

test('apply patch - rejects a negative sibling index without mutating DOM', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-sibling-negative')
  expectStableNavigationFailure(result, 'Cannot navigate to sibling')
})

test('apply patch - rejects a sibling index beyond the sibling list', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-sibling-too-large')
  expectStableNavigationFailure(result, 'Cannot navigate to sibling')
})

test('apply patch - rejects sibling navigation from a detached node', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-sibling-detached')
  expect(result).toMatchObject({ id: '', connected: false })
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain('current node has no parent')
})

test('apply patch - rejects parent navigation from a detached node', async ({
  page,
}) => {
  const result = await openCase(page, 'navigate-parent-detached')
  expect(result).toMatchObject({ id: '', connected: false })
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain('current node has no parent')
})

test('apply patch - keeps the old node when a reference instance is missing', async ({
  page,
}) => {
  const result = await openCase(page, 'reference-instance-missing')
  expect(result.html).toBe('<div><span>stable</span></div>')
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain('instance not found')
})

test('apply patch - keeps the old node when reference state is missing', async ({
  page,
}) => {
  const result = await openCase(page, 'reference-state-missing')
  expect(result.html).toBe('<div><span>stable</span></div>')
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain('instance not found')
})

test('apply patch - reports a mutation error and skips later patches', async ({
  page,
}) => {
  const result = await openCase(page, 'mutation-error-stops-following-patches')
  expect(result.text).toBe('before')
  expect(result.thrown).toContain('setAttribute')
  expect(result.errors).toHaveLength(1)
  expect(result.errors[0]).toContain('Error applying patch at index 0')
})

test('render - an empty virtual DOM clears existing content', async ({
  page,
}) => {
  const result = await openCase(page, 'render-empty-clears-existing-content')
  expect(result).toMatchObject({ html: '', childCount: 0 })
})

test('render - preserves mixed root fragment order', async ({ page }) => {
  const result = await openCase(page, 'render-root-fragment')
  expect(result.html).toBe('before<span>middle</span>after')
  expect(result.nodeTypes).toEqual([3, 1, 3])
})

test('render - preserves empty text nodes at child boundaries', async ({
  page,
}) => {
  const result = await openCase(page, 'render-empty-text-boundaries')
  expect(result.childCount).toBe(3)
  expect(result.nodeTypes).toEqual([3, 1, 3])
  expect(result.nodeValues).toEqual(['', null, ''])
})

test('render - preserves nested empty sibling structure', async ({ page }) => {
  const result = await openCase(page, 'render-nested-empty-siblings')
  expect(result.html).toBe(
    '<div><section id="first"></section><div id="middle"><span id="nested-empty"></span></div><section id="last"></section></div>',
  )
})

test('render - uses fallback text for a missing reference instance', async ({
  page,
}) => {
  const result = await openCase(page, 'render-reference-instance-missing')
  expect(result).toMatchObject({
    html: 'Reference node not found',
    nodeType: 3,
  })
})

test('render - uses fallback text for reference state that is missing', async ({
  page,
}) => {
  const result = await openCase(page, 'render-reference-state-missing')
  expect(result).toMatchObject({
    html: 'Reference node not found',
    nodeType: 3,
  })
})

test('render - applies virtual DOM props to an external reference node', async ({
  page,
}) => {
  const result = await openCase(page, 'render-reference-applies-props')
  expect(result.sameNode).toBe(true)
  expect(result.html).toBe(
    '<button id="reference-button" class="reference-class" title="Reference title">external</button>',
  )
})

test('render - warns and remains interactive when an event listener is missing', async ({
  page,
}) => {
  const result = await openCase(page, 'render-missing-event-listener')
  expect(result.html).toBe(
    '<button id="missing-listener-button">click</button>',
  )
  expect(result.warnings).toEqual(['listener not found 999'])
  expect(result.errors).toEqual([])
})

test('render - handles zero and false attribute values', async ({ page }) => {
  const result = await openCase(page, 'render-zero-and-false-props')
  expect(result).toMatchObject({
    id: null,
    dataZero: '0',
    ariaHidden: 'false',
  })
})

test('render - applies zero dimensions to elements and images', async ({
  page,
}) => {
  const result = await openCase(page, 'render-zero-dimensions')
  expect(result).toMatchObject({
    divWidth: '0px',
    divHeight: '0px',
    imageWidth: 0,
    imageHeight: 0,
  })
})

test('diff - identical trees produce no patches and preserve node identity', async ({
  page,
}) => {
  const result = await openCase(page, 'diff-identical-preserves-node')
  expect(result).toMatchObject({
    patchCount: 0,
    rootPreserved: true,
    childPreserved: true,
  })
})

test('diff - empty fragments produce no patches', async ({ page }) => {
  const result = await openCase(page, 'diff-empty-fragments')
  expect(result).toMatchObject({ patchCount: 0, html: '' })
})

test('diff - adds the only root to an empty fragment', async ({ page }) => {
  const result = await openCase(page, 'diff-add-only-root')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.html).toBe('<div id="added-root"><span>added</span></div>')
})

test('diff - removes the only root from a fragment', async ({ page }) => {
  const result = await openCase(page, 'diff-remove-only-root')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.html).toBe('')
})

test('diff - replaces a root element with a text node', async ({ page }) => {
  const result = await openCase(page, 'diff-root-element-to-text')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result).toMatchObject({ html: 'plain', nodeType: 3 })
})

test('diff - replaces a root text node with an element', async ({ page }) => {
  const result = await openCase(page, 'diff-root-text-to-element')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result).toMatchObject({
    html: '<span id="new-root">new</span>',
    nodeType: 1,
  })
})

test('diff - updates an empty text node and restores its content', async ({
  page,
}) => {
  const result = await openCase(page, 'diff-text-empty-round-trip')
  expect(result).toMatchObject({
    emptyChildCount: 1,
    html: '<div>restored</div>',
    nodeType: 3,
  })
})

test('diff - appends a root to a multi-root fragment', async ({ page }) => {
  const result = await openCase(page, 'diff-append-root-to-fragment')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.childCount).toBe(3)
  expect(result.html).toBe(
    '<span>one</span><span>two</span><span id="third-root">three</span>',
  )
})

test('diff - removes the middle root from a multi-root fragment', async ({
  page,
}) => {
  const result = await openCase(page, 'diff-remove-middle-root-from-fragment')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.childCount).toBe(2)
  expect(result.html).toBe(
    '<span id="first-root">one</span><span id="last-root">three</span>',
  )
})

test('diff - replaces one fragment root and updates its sibling', async ({
  page,
}) => {
  const result = await openCase(page, 'diff-replace-root-and-update-sibling')
  expect(result.patchCount).toBeGreaterThan(0)
  expect(result.html).toBe(
    '<span id="replacement">new</span><span id="sibling" class="after">stable</span>',
  )
})
