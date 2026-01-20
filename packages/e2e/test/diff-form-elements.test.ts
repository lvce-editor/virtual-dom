import { test, expect } from '../src/fixtures.ts'

test('diff - form elements changes', async ({ page }) => {
  await page.goto('/diff/form-elements.html')

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  const container = page.locator('#diff-container')
  const nameInput = container.locator('#name')
  const emailInput = container.locator('#email')
  const textarea = container.locator('#message')
  await expect(nameInput).toBeVisible()
  await expect(nameInput).toHaveAttribute('type', 'text')
  await expect(nameInput).toHaveAttribute('placeholder', 'Name')
  await expect(emailInput).toBeVisible()
  await expect(emailInput).toHaveAttribute('type', 'email')
  await expect(emailInput).toHaveAttribute('placeholder', 'Email')
  await expect(textarea).toBeVisible()
  await expect(textarea).toHaveAttribute('placeholder', 'Message')
})
