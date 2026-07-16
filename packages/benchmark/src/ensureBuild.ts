import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const root = join(packageRoot, '../..')

export const ensureBuild = async (): Promise<void> => {
  const expectedFiles = [
    join(root, 'dist', 'virtual-dom', 'dist', 'index.js'),
    join(root, 'dist', 'virtual-dom-worker', 'dist', 'index.js'),
  ]

  try {
    await Promise.all(expectedFiles.map((path) => access(path)))
  } catch {
    throw new Error(
      `Build files not found. Run 'npm run build' before the benchmark.\n` +
        expectedFiles.map((path) => `  - ${path}`).join('\n'),
    )
  }
}
