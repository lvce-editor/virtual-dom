import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getStaticCommitRoot } from './staticServerPaths.ts'

const resetReplacementRegex =
  /await invoke(?:\$\w+)?\('FileSystem\.mkdir', 'memfs:\/\/\/workspace'\);/
const resetRemovalOccurrenceRegex =
  /(^[ \t]*)await (invoke(?:\$\w+)?)\('FileSystem\.remove', 'memfs:\/\/\/workspace'\);/m
const resetOccurrenceRegex =
  /(^[ \t]*)await (invoke(?:\$\w+)?)\('Layout\.reset'\);/m

export const addExplorerResetHook = (content: string): string => {
  if (resetReplacementRegex.test(content)) {
    return content
  }
  const removalMatch = resetRemovalOccurrenceRegex.exec(content)
  const removalIndent = removalMatch?.[1]
  const removalInvoke = removalMatch?.[2]
  if (
    removalMatch &&
    removalIndent !== undefined &&
    removalInvoke !== undefined
  ) {
    const resetWorkspace = `${removalMatch[0]}
${removalIndent}await ${removalInvoke}('FileSystem.mkdir', 'memfs:///workspace');`
    return content.replace(removalMatch[0], () => resetWorkspace)
  }
  const match = resetOccurrenceRegex.exec(content)
  const indent = match?.[1]
  const invoke = match?.[2]
  if (!match || indent === undefined || invoke === undefined) {
    throw new Error('Could not find the Explorer test reset hook')
  }
  const resetReplacement = `${indent}await ${invoke}('FileSystem.remove', 'memfs:///workspace');
${indent}await ${invoke}('FileSystem.mkdir', 'memfs:///workspace');
${indent}await ${invoke}('Layout.reset');
${indent}await ${invoke}('Layout.hideSideBar');
${indent}await ${invoke}('Layout.showSideBar');`
  return content.replace(match[0], () => resetReplacement)
}

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
  const instrumented = addExplorerResetHook(content)
  if (instrumented !== content) {
    await writeFile(testWorkerPath, instrumented)
  }
}
