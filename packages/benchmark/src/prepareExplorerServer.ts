import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getStaticCommitRoot } from './staticServerPaths.ts'

const resetMarker = 'virtual-dom-benchmark-explorer-reset'
const resetIndentation = ' '.repeat(4)
const resetOccurrenceRegex =
  /^ {4}await (invoke(?:\$\w+)?)\('Layout\.reset'\);$/m

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

export const addExplorerReset = (content: string): string => {
  if (content.includes(resetMarker)) {
    return content
  }
  const match = resetOccurrenceRegex.exec(content)
  if (!match) {
    throw new Error('Could not find the Explorer test reset hook')
  }
  const [, invoke] = match
  const resetReplacement = `${resetIndentation}// ${resetMarker}
${resetIndentation}await ${invoke}('FileSystem.remove', 'memfs:///workspace');
${resetIndentation}await ${invoke}('Layout.reset');
${resetIndentation}await ${invoke}('Layout.hideSideBar');
${resetIndentation}await ${invoke}('Layout.showSideBar');`
  return content.replace(resetOccurrenceRegex, () => resetReplacement)
}

export const prepareExplorerServer = async (): Promise<void> => {
  const testWorkerPath = await getTestWorkerPath()
  const content = await readFile(testWorkerPath, 'utf8')
  const prepared = addExplorerReset(content)
  if (prepared !== content) {
    await writeFile(testWorkerPath, prepared)
  }
}
