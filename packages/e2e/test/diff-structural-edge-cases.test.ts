import type { Page } from '@playwright/test'
import { test, expect } from '../src/fixtures.ts'

const openCase = async (page: Page, caseName: string): Promise<void> => {
  await page.goto(`/diff/structural-edge-cases.html#${caseName}`)
  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })
}

const expectHtml = async (page: Page, expected: string): Promise<void> => {
  const container = page.locator('#diff-container')
  expect(await container.innerHTML()).toBe(expected)
}

test('diff - prepend text in a nested element', async ({ page }) => {
  await openCase(page, 'nested-prepend-text')
  await expectHtml(page, '<div><section>Lead <span>Tail</span></section></div>')
})

test('diff - append text in a nested element', async ({ page }) => {
  await openCase(page, 'nested-append-text')
  await expectHtml(page, '<div><section><span>Lead</span> Tail</section></div>')
})

test('diff - remove leading text from a nested element', async ({ page }) => {
  await openCase(page, 'nested-remove-leading-text')
  await expectHtml(page, '<div><section><span>Keep</span></section></div>')
})

test('diff - remove trailing text from a nested element', async ({ page }) => {
  await openCase(page, 'nested-remove-trailing-text')
  await expectHtml(page, '<div><section><span>Keep</span></section></div>')
})

test('diff - replace the first sibling element', async ({ page }) => {
  await openCase(page, 'replace-first-element')
  await expectHtml(
    page,
    '<div><section id="first">New</section><span id="second">Stable</span></div>',
  )
})

test('diff - replace the last sibling element', async ({ page }) => {
  await openCase(page, 'replace-last-element')
  await expectHtml(
    page,
    '<div><span id="first">Stable</span><section id="second">New</section></div>',
  )
})

test('diff - populate an empty nested element and update its sibling', async ({
  page,
}) => {
  await openCase(page, 'populate-empty-nested-element')
  await expectHtml(
    page,
    '<div><section id="target"><p>Added</p></section><span id="status">After</span></div>',
  )
})

test('diff - empty a nested element and update its sibling', async ({
  page,
}) => {
  await openCase(page, 'empty-nested-element')
  await expectHtml(
    page,
    '<div><section id="target"></section><span id="status" class="after">Stable</span></div>',
  )
})

test('diff - increase nesting depth without changing a sibling', async ({
  page,
}) => {
  await openCase(page, 'increase-nesting-depth')
  await expectHtml(
    page,
    '<div><section id="target"><span>Content</span></section><p id="sibling">Stable</p></div>',
  )
})

test('diff - decrease nesting depth without changing a sibling', async ({
  page,
}) => {
  await openCase(page, 'decrease-nesting-depth')
  await expectHtml(
    page,
    '<div><span id="target">Content</span><p id="sibling">Stable</p></div>',
  )
})
