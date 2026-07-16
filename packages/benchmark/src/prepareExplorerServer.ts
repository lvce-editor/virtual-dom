import { readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const staticServerPackagePath = fileURLToPath(
  import.meta.resolve('@lvce-editor/static-server/package.json'),
)
const staticRoot = join(dirname(staticServerPackagePath), 'static')
const commitHashRegex = /^[a-z\d]{7}$/
const resetOccurrence = `    await invoke('Layout.reset');`
const resetReplacement = `    await invoke('FileSystem.remove', 'memfs:///workspace');
    await invoke('Layout.reset');
    await invoke('Layout.hideSideBar');
    await invoke('Layout.showSideBar');`

const getTestWorkerPath = async (): Promise<string> => {
  const dirents = await readdir(staticRoot)
  const commitHash = dirents.find((dirent) => commitHashRegex.test(dirent))
  if (!commitHash) {
    throw new Error('Could not find the static server commit directory')
  }
  return join(
    staticRoot,
    commitHash,
    'packages',
    'test-worker',
    'dist',
    'testWorkerMain.js',
  )
}

export const prepareExplorerServer = async (): Promise<void> => {
  const testWorkerPath = await getTestWorkerPath()
  const content = await readFile(testWorkerPath, 'utf8')
  if (content.includes(resetReplacement)) {
    return
  }
  if (!content.includes(resetOccurrence)) {
    throw new Error('Could not find the Explorer test reset hook')
  }
  await writeFile(
    testWorkerPath,
    content.replace(resetOccurrence, () => resetReplacement),
  )
}
