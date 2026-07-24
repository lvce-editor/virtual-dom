import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getExplorerViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '0cfcbf6679dbb0a54d4a3416d7fd61569a62b5a7',
    defaultRef: 'v7.15.1',
    downloadRoot: join(temporaryRoot, 'explorer-view'),
    id: 'explorer-view',
    label: 'Explorer',
    localPath: process.env.EXPLORER_VIEW_PATH,
    ref: process.env.EXPLORER_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/explorer-view.git',
    temporaryRoot,
  })
}
