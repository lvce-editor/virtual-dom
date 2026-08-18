import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getTitleBarWorkerTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '4a72984401ceac702c696b733180d0440fdb3eee',
    defaultRef: 'v4.19.0',
    downloadRoot: join(temporaryRoot, 'title-bar-worker'),
    id: 'title-bar-worker',
    label: 'Title bar',
    localPath: process.env.TITLE_BAR_WORKER_PATH,
    ref: process.env.TITLE_BAR_WORKER_REF,
    repositoryUrl: 'https://github.com/lvce-editor/title-bar-worker.git',
    temporaryRoot,
  })
}
