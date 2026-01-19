import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '../../..')

export const ensureBuild = async () => {
  // Check that .tmp files exist (ensures build has run)
  const virtualDomWorkerTmp = join(root, '.tmp', 'tsc-dist', 'src', 'index.js')
  // Check that dist files exist (what we'll actually serve)
  const virtualDomWorkerDist = join(
    root,
    'dist',
    'virtual-dom-worker',
    'dist',
    'index.js',
  )
  const virtualDomDist = join(root, 'dist', 'virtual-dom', 'dist', 'index.js')

  try {
    await access(virtualDomWorkerTmp)
    await access(virtualDomWorkerDist)
    await access(virtualDomDist)
  } catch (error) {
    throw new Error(
      `Build files not found. Please run 'npm run build' first.\n` +
        `Expected files:\n` +
        `  - ${virtualDomWorkerTmp}\n` +
        `  - ${virtualDomWorkerDist}\n` +
        `  - ${virtualDomDist}`,
    )
  }
}
