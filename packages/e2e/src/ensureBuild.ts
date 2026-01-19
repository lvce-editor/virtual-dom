import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '../../..')

export const ensureBuild = async (): Promise<void> => {
  const virtualDomWorkerDist = join(
    root,
    '.tmp',
    'tsc-dist',
    'src',
    'index.js',
  )
  const virtualDomDist = join(root, 'dist', 'virtual-dom', 'dist', 'index.js')

  try {
    await access(virtualDomWorkerDist)
    await access(virtualDomDist)
  } catch (error) {
    throw new Error(
      `Build files not found. Please run 'npm run build' first.\n` +
        `Expected files:\n` +
        `  - ${virtualDomWorkerDist}\n` +
        `  - ${virtualDomDist}`,
    )
  }
}
