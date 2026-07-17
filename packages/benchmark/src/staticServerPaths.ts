import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const staticServerPackagePath = fileURLToPath(
  import.meta.resolve('@lvce-editor/static-server/package.json'),
)
const staticRoot = join(dirname(staticServerPackagePath), 'static')
const commitHashRegex = /^[a-z\d]{7}$/

export const getStaticCommitRoot = async (): Promise<string> => {
  const dirents = await readdir(staticRoot, { withFileTypes: true })
  const commitDirectory = dirents.find(
    (dirent) => dirent.isDirectory() && commitHashRegex.test(dirent.name),
  )
  if (!commitDirectory) {
    throw new Error('Could not find the static server commit directory')
  }
  return join(staticRoot, commitDirectory.name)
}
