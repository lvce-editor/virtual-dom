import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getExplorerViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '78ce679f96fd5b3f4b7840826f4ce77b1f60852d',
    defaultRef: 'v7.27.1',
    downloadRoot: join(temporaryRoot, 'explorer-view'),
    id: 'explorer-view',
    label: 'Explorer',
    localPath: process.env.EXPLORER_VIEW_PATH,
    ref: process.env.EXPLORER_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/explorer-view.git',
    temporaryRoot,
  })
}
