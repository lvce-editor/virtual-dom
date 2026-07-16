import { execFile } from 'node:child_process'
import { access, mkdir, readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')
const downloadRoot = join(temporaryRoot, 'explorer-view')
const repositoryUrl = 'https://github.com/lvce-editor/explorer-view.git'

export interface ExplorerViewTests {
  readonly commit: string
  readonly source: string
  readonly testFiles: readonly string[]
  readonly testPath: string
}

const getCommit = async (root: string): Promise<string> => {
  const { stdout } = await execFileAsync('git', [
    '-C',
    root,
    'rev-parse',
    'HEAD',
  ])
  return stdout.trim()
}

const getTestPath = async (root: string): Promise<string> => {
  const nestedTestPath = join(root, 'packages', 'e2e')
  try {
    await access(join(nestedTestPath, 'src'))
    return nestedTestPath
  } catch {
    await access(join(root, 'src'))
    return root
  }
}

const getTestFiles = async (testPath: string): Promise<readonly string[]> => {
  const files = await readdir(join(testPath, 'src'))
  return files
    .filter(
      (file) =>
        !file.startsWith('_') && (file.endsWith('.js') || file.endsWith('.ts')),
    )
    .map((file) => file.replace(/\.(?:js|ts)$/, '.js'))
    .toSorted((a, b) => a.localeCompare(b))
}

const getLocalTests = async (path: string): Promise<ExplorerViewTests> => {
  const root = resolve(path)
  const testPath = await getTestPath(root)
  return {
    commit: await getCommit(root),
    source: root,
    testFiles: await getTestFiles(testPath),
    testPath,
  }
}

const downloadTests = async (): Promise<ExplorerViewTests> => {
  const ref = process.env.EXPLORER_VIEW_REF || 'main'
  await rm(downloadRoot, { force: true, recursive: true })
  await mkdir(temporaryRoot, { recursive: true })
  process.stdout.write(`Downloading explorer-view e2e tests (${ref})...\n`)
  await execFileAsync('git', [
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    '--branch',
    ref,
    repositoryUrl,
    downloadRoot,
  ])
  await execFileAsync('git', [
    '-C',
    downloadRoot,
    'sparse-checkout',
    'set',
    'packages/e2e',
  ])
  const testPath = join(downloadRoot, 'packages', 'e2e')
  return {
    commit: await getCommit(downloadRoot),
    source: `${repositoryUrl}#${ref}`,
    testFiles: await getTestFiles(testPath),
    testPath,
  }
}

export const getExplorerViewTests = async (): Promise<ExplorerViewTests> => {
  const localPath = process.env.EXPLORER_VIEW_PATH
  if (localPath) {
    return getLocalTests(localPath)
  }
  return downloadTests()
}
