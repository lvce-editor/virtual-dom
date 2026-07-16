import { execFile } from 'node:child_process'
import { access, mkdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

export interface BenchmarkTests {
  readonly commit: string
  readonly id: string
  readonly label: string
  readonly source: string
  readonly testPath: string
}

interface BenchmarkTestsOptions {
  readonly defaultCommit: string
  readonly defaultRef: string
  readonly downloadRoot: string
  readonly id: string
  readonly label: string
  readonly localPath: string | undefined
  readonly ref: string | undefined
  readonly repositoryUrl: string
  readonly temporaryRoot: string
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

const getLocalTests = async (
  options: BenchmarkTestsOptions,
  localPath: string,
): Promise<BenchmarkTests> => {
  const root = resolve(localPath)
  const testPath = await getTestPath(root)
  return {
    commit: await getCommit(root),
    id: options.id,
    label: options.label,
    source: root,
    testPath,
  }
}

const downloadTests = async (
  options: BenchmarkTestsOptions,
): Promise<BenchmarkTests> => {
  const ref = options.ref || options.defaultRef
  await rm(options.downloadRoot, { force: true, recursive: true })
  await mkdir(options.temporaryRoot, { recursive: true })
  process.stdout.write(`Downloading ${options.id} e2e tests (${ref})...\n`)
  await execFileAsync('git', [
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    '--branch',
    ref,
    options.repositoryUrl,
    options.downloadRoot,
  ])
  await execFileAsync('git', [
    '-C',
    options.downloadRoot,
    'sparse-checkout',
    'set',
    'packages/e2e',
  ])
  const testPath = join(options.downloadRoot, 'packages', 'e2e')
  const commit = await getCommit(options.downloadRoot)
  if (ref === options.defaultRef && commit !== options.defaultCommit) {
    throw new Error(
      `Expected ${options.id} ${options.defaultRef} to resolve to ${options.defaultCommit}, got ${commit}`,
    )
  }
  return {
    commit,
    id: options.id,
    label: options.label,
    source: `${options.repositoryUrl}#${ref}`,
    testPath,
  }
}

export const getBenchmarkTests = async (
  options: BenchmarkTestsOptions,
): Promise<BenchmarkTests> => {
  if (options.localPath) {
    return getLocalTests(options, options.localPath)
  }
  return downloadTests(options)
}
