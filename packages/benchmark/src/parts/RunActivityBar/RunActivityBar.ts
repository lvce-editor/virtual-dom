import { getActivityBarWorkerTests } from '../ActivityBarWorker/ActivityBarWorker.ts'
import { activityBarAllowedFailures } from '../AllowedFailures/AllowedFailures.ts'
import { runDetailedBenchmark } from '../RunDetailed/RunDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: activityBarAllowedFailures,
  getTests: getActivityBarWorkerTests,
  outputPath: 'activity-bar-benchmark',
})
