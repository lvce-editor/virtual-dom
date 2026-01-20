import { test as base } from '@playwright/test'

export const test = base.extend({
  page: async ({ page }, use) => {
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
})

export { expect } from '@playwright/test'
