import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getTitleBarWorkerTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: 'b473917aa420a4565ff8bb5defe60b1d95491b27',
    defaultRef: 'v4.9.2',
    downloadRoot: join(temporaryRoot, 'title-bar-worker'),
    id: 'title-bar-worker',
    label: 'Title bar',
    localPath: process.env.TITLE_BAR_WORKER_PATH,
    ref: process.env.TITLE_BAR_WORKER_REF,
    repositoryUrl: 'https://github.com/lvce-editor/title-bar-worker.git',
    temporaryRoot,
  })
}
