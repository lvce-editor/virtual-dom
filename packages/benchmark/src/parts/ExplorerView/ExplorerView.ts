import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  getBenchmarkTests,
  type BenchmarkTests,
} from '../BenchmarkTests/BenchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('../../..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getExplorerViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: 'e3af204ace90be4d3de10b7a512d03551a1a1e2d',
    defaultRef: 'v7.49.0',
    downloadRoot: join(temporaryRoot, 'explorer-view'),
    id: 'explorer-view',
    label: 'Explorer',
    localPath: process.env.EXPLORER_VIEW_PATH,
    ref: process.env.EXPLORER_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/explorer-view.git',
    temporaryRoot,
  })
}
