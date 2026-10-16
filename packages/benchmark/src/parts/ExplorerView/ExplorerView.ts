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
    defaultCommit: '89cd433890d26ae05a675e83676add7b81a10922',
    defaultRef: '89cd433890d26ae05a675e83676add7b81a10922',
    downloadRoot: join(temporaryRoot, 'explorer-view'),
    id: 'explorer-view',
    label: 'Explorer',
    localPath: process.env.EXPLORER_VIEW_PATH,
    ref: process.env.EXPLORER_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/explorer-view.git',
    temporaryRoot,
  })
}
