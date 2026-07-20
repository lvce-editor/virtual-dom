import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getActivityBarWorkerTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '61aa9a5d6200b3b139d4fa12532d5ff23052b29c',
    defaultRef: 'v7.12.0',
    downloadRoot: join(temporaryRoot, 'activity-bar-worker'),
    id: 'activity-bar-worker',
    label: 'Activity bar',
    localPath: process.env.ACTIVITY_BAR_WORKER_PATH,
    ref: process.env.ACTIVITY_BAR_WORKER_REF,
    repositoryUrl: 'https://github.com/lvce-editor/activity-bar-worker.git',
    temporaryRoot,
  })
}
