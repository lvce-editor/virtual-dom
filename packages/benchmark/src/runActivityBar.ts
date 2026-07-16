import { getActivityBarWorkerTests } from './activityBarWorker.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  getTests: getActivityBarWorkerTests,
  outputPath: 'activity-bar-benchmark',
})
