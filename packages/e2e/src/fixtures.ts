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
    async ({ context }, use): Promise<void> => {
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

      await use(page)
    },
    { scope: 'test', timeout: 15_000 },
  ],
})

export { expect } from '@playwright/test'
