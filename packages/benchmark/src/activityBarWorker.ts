import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getActivityBarWorkerTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '25836d6423028fe7e4d28d0db951397eef78e43b',
    defaultRef: 'v7.23.0',
    downloadRoot: join(temporaryRoot, 'activity-bar-worker'),
    id: 'activity-bar-worker',
    label: 'Activity bar',
    localPath: process.env.ACTIVITY_BAR_WORKER_PATH,
    ref: process.env.ACTIVITY_BAR_WORKER_REF,
    repositoryUrl: 'https://github.com/lvce-editor/activity-bar-worker.git',
    temporaryRoot,
  })
}
