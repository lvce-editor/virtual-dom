import { test, expect } from '@playwright/test'

test('applies diff patches to update DOM', async ({ page }) => {
  await page.goto('/diff/diff.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  await expect(container).toBeVisible()

  const firstDiv = container.locator('div').first()
  await expect(firstDiv).toHaveText('Updated Text')
})

test('diff - text node change', async ({ page }) => {
  await page.goto('/diff/text-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('Updated Text')
})

test('diff - attribute change', async ({ page }) => {
  await page.goto('/diff/attribute-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div class="new-class" id="new-id">Hello</div>')
})

test('diff - attribute removal', async ({ page }) => {
  await page.goto('/diff/attribute-removal.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div>Hello</div>')
})

test('diff - node type change', async ({ page }) => {
  await page.goto('/diff/node-type-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<span>Hello</span>')
})

test('diff - nested text change', async ({ page }) => {
  await page.goto('/diff/nested-text-change.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>Updated</span></div>')
})

test('diff - add child', async ({ page }) => {
  await page.goto('/diff/add-child.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>First</span><span>Second</span></div>')
})

test('diff - remove child', async ({ page }) => {
  await page.goto('/diff/remove-child.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>First</span></div>')
})

test('diff - multiple children text changes', async ({ page }) => {
  await page.goto('/diff/multiple-children-text.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>One</span><span>Two</span><span>Three</span></div>',
  )
})

test('diff - deep nested structure', async ({ page }) => {
  await page.goto('/diff/deep-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><div><div><span>Deep Text</span></div></div></div>',
  )
})

test('diff - complex mixed changes', async ({ page }) => {
  await page.goto('/diff/complex-mixed.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div class="updated" id="new-id"><span>Updated Text</span><div>New Child</div></div>',
  )
})

test('diff - multiple attribute changes', async ({ page }) => {
  await page.goto('/diff/multiple-attributes.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div class="new-class" id="new-id" data-test="value">Content</div>',
  )
})

test('diff - add multiple children', async ({ page }) => {
  await page.goto('/diff/add-multiple-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>First</span><span>Second</span><span>Third</span></div>',
  )
})

test('diff - remove multiple children', async ({ page }) => {
  await page.goto('/diff/remove-multiple-children.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div></div>')
})

test('diff - change middle child', async ({ page }) => {
  await page.goto('/diff/change-middle-child.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><span>First</span><span>Updated Middle</span><span>Third</span></div>',
  )
})

test('diff - replace nested structure', async ({ page }) => {
  await page.goto('/diff/replace-nested.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><div><span>New Structure</span></div></div>')
})

test('diff - empty to content', async ({ page }) => {
  await page.goto('/diff/empty-to-content.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div><span>New Content</span></div>')
})

test('diff - content to empty', async ({ page }) => {
  await page.goto('/diff/content-to-empty.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<div></div>')
})

test('diff - sibling navigation complex', async ({ page }) => {
  await page.goto('/diff/sibling-navigation.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe(
    '<div><div>First</div><div>Updated Second</div><div>Third</div></div>',
  )
})

test('diff - table structure', async ({ page }) => {
  await page.goto('/diff/table-structure.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const innerHTML = await container.innerHTML()
  expect(innerHTML).toBe('<table><tr><td>New Cell</td></tr></table>')
})
