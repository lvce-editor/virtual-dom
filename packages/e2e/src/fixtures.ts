import { test as base } from '@playwright/test'

export const test = base.extend({
  // Browser lifecycle work has its own budget; DOM checks keep the five-second test budget.
  context: [
    async ({ browser }, use): Promise<void> => {
      const context = await browser.newContext()
      try {
        await use(context)
      } finally {
        await context.close()
      }
    },
    { scope: 'test', timeout: 15_000 },
  ],
  page: [
    async ({ context }, use, testInfo): Promise<void> => {
      const page = await context.newPage()
      // Capture console messages
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          console.error(`[Browser Error] ${msg.text()}`)
        }
      })

      // Capture uncaught exceptions
      page.on('pageerror', (error) => {
        console.error(`[Browser Exception] ${error.message}`)
        console.error(error.stack)
      })

      try {
        await use(page)
      } finally {
        if (testInfo.status !== testInfo.expectedStatus) {
          let evidence: unknown
          try {
            evidence = await page.evaluate(() => ({
              // @ts-ignore
              readyState: globalThis.document.readyState,
              // @ts-ignore
              location: globalThis.location.href,
              // @ts-ignore
              complete: globalThis.__virtualDomDiffTestComplete,
              // @ts-ignore
              sequenceReady: typeof globalThis.runEdgeCaseSequence,
              // @ts-ignore
              navigation: globalThis.performance
                .getEntriesByType('navigation')
                .map((entry) => entry.toJSON()),
              // @ts-ignore
              resources: globalThis.performance
                .getEntriesByType('resource')
                .map((entry) => entry.toJSON()),
            }))
          } catch (error) {
            evidence = { captureError: String(error) }
          }
          await testInfo.attach('page-readiness', {
            body: JSON.stringify(evidence),
            contentType: 'application/json',
          })
        }
      }
    },
    { scope: 'test', timeout: 15_000 },
  ],
})

export { expect } from '@playwright/test'
