import { execa } from 'execa'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { root } from './root.js'

export const generateApiTypes = async ({ packageName }) => {
  // Create dist directory
  await mkdir(join(root, 'dist', packageName, 'dist'), { recursive: true })

  // Use TypeScript to generate simple declaration files
  await execa(
    'npx',
    [
      'tsc',
      '--declaration',
      '--emitDeclarationOnly',
      '--noEmit',
      'false',
      '--lib',
      'es2020,dom',
      '--target',
      'es2020',
      '--module',
      'es2020',
      'packages/' + packageName + '/src/index.ts',
      '--outDir',
      'dist/' + packageName + '/dist',
    ],
    {
      cwd: root,
      reject: false,
    },
  )
}
