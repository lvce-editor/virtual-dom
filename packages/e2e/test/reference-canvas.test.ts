import { expect, test } from '../src/fixtures.ts'

test('reference canvas reflects dimensions without selecting a drawing context', async ({
  page,
}) => {
  await page.goto('/diff/reference-canvas.html')
  const canvas = page.locator('#scene')
  const pixel = page.locator('#pixel')
  await expect(canvas).toHaveAttribute('width', '400')
  await expect(canvas).toHaveAttribute('height', '300')
  const start = page.locator('#start')
  await start.press('Enter')
  await expect(pixel).toHaveText('0,0,255,255')
  await page.locator('#swap').press('Enter')
  await expect(canvas).toHaveAttribute('width', '400')
  await expect(canvas).toHaveAttribute('height', '300')
  await expect(pixel).toHaveText('255,0,0,255')
})
