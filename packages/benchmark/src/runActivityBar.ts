import { getActivityBarWorkerTests } from './activityBarWorker.ts'
import { activityBarAllowedFailures } from './allowedFailures.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: activityBarAllowedFailures,
  getTests: getActivityBarWorkerTests,
  outputPath: 'activity-bar-benchmark',
})
