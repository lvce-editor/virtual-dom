import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const disabledFeaturesPrefix = '--disable-features='

export const chromiumLaunchArgs = (platform = process.platform): string[] => {
  if (platform !== 'win32') {
    return []
  }
  // Match test-with-playwright: Windows randomized allocation can fail with WSAENOBUFS.
  // Preserve Playwright's existing disabled features when adding the workaround.
  const { server } = require('playwright-core/lib/coreBundle')
  const playwright = server.createPlaywright({ sdkLanguage: 'javascript' })
  const defaultArgs: readonly string[] = playwright.chromium._innerDefaultArgs(
    {},
  )
  const disabledFeatures = defaultArgs.find((argument) =>
    argument.startsWith(disabledFeaturesPrefix),
  )
  if (!disabledFeatures) {
    throw new Error('Could not find Playwright Chromium disabled features')
  }
  return [`${disabledFeatures},TcpPortRandomizationWin`]
}
