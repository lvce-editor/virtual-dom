import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getExplorerViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '4385c69e76d601c900d2c7ea39ee8f5cae1de72b',
    defaultRef: 'v7.12.0',
    downloadRoot: join(temporaryRoot, 'explorer-view'),
    id: 'explorer-view',
    label: 'Explorer',
    localPath: process.env.EXPLORER_VIEW_PATH,
    ref: process.env.EXPLORER_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/explorer-view.git',
    temporaryRoot,
  })
}
