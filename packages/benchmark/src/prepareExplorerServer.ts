import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getStaticCommitRoot } from './staticServerPaths.ts'
const resetOccurrence = `    await invoke('Layout.reset');`
const resetReplacement = `    await invoke('FileSystem.remove', 'memfs:///workspace');
    await invoke('Layout.reset');
    await invoke('Layout.hideSideBar');
    await invoke('Layout.showSideBar');`

const getTestWorkerPath = async (): Promise<string> => {
  const staticCommitRoot = await getStaticCommitRoot()
  return join(
    staticCommitRoot,
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
