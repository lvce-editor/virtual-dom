import type { Page } from '@playwright/test'

export const runLargeDomDiff = async (
  page: Page,
  scenarioName: string,
): Promise<any> => {
  await page.goto(`/diff/large-dom-changes.html#${scenarioName}`)

  await page.waitForFunction(() => {
    // @ts-ignore
    return globalThis.__virtualDomDiffTestComplete === true
  })

  return page.evaluate(() => {
    // @ts-ignore
    return globalThis.__virtualDomLargeDiffResult
  })
}
