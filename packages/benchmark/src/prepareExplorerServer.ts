import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getStaticCommitRoot } from './staticServerPaths.ts'

const resetReplacementRegex =
  /await invoke(?:\$\w+)?\('FileSystem\.mkdir', 'memfs:\/\/\/workspace'\);/
const resetRemovalOccurrenceRegex =
  /(^[ \t]*)await (invoke(?:\$\w+)?)\('FileSystem\.remove', 'memfs:\/\/\/workspace'\);/m
const resetOccurrenceRegex =
  /(^[ \t]*)await (invoke(?:\$\w+)?)\('Layout\.reset'\);/m
const workspaceSetPathReplacementRegex =
  /await invoke(?:\$\w+)?\('FileSystem\.mkdir', path\);/
const workspaceSetPathOccurrenceRegex =
  /(^[ \t]*const setPath = async path => \{\n)([ \t]*)await (invoke(?:\$\w+)?)\('Workspace\.setPath', path\);/m

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

export const addWorkspaceSetPathHook = (content: string): string => {
  if (workspaceSetPathReplacementRegex.test(content)) {
    return content
  }
  const match = workspaceSetPathOccurrenceRegex.exec(content)
  const header = match?.[1]
  const indent = match?.[2]
  const invoke = match?.[3]
  if (!match || header === undefined || indent === undefined || !invoke) {
    throw new Error('Could not find the workspace setPath helper')
  }
  const replacement = `${header}${indent}await ${invoke}('FileSystem.mkdir', path);
${indent}await ${invoke}('Workspace.setPath', path);`
  return content.replace(match[0], () => replacement)
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
  const withExplorerReset = addExplorerResetHook(content)
  const instrumented = addWorkspaceSetPathHook(withExplorerReset)
  if (instrumented !== content) {
    await writeFile(testWorkerPath, instrumented)
  }
}
