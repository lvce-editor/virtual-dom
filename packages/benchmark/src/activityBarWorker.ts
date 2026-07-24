import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getActivityBarWorkerTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: 'a4c7b549152890666741ce0be219d6b13de9681f',
    defaultRef: 'v7.14.1',
    downloadRoot: join(temporaryRoot, 'activity-bar-worker'),
    id: 'activity-bar-worker',
    label: 'Activity bar',
    localPath: process.env.ACTIVITY_BAR_WORKER_PATH,
    ref: process.env.ACTIVITY_BAR_WORKER_REF,
    repositoryUrl: 'https://github.com/lvce-editor/activity-bar-worker.git',
    temporaryRoot,
  })
}
