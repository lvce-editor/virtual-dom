import { getActivityBarWorkerTests } from './activityBarWorker.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: [
    'activity-bar.account.context-menu.logging-in.js',
    'activity-bar.account.context-menu.logging-out.js',
    'activity-bar.account.context-menu.signed-in.js',
  ],
  getTests: getActivityBarWorkerTests,
  outputPath: 'activity-bar-benchmark',
})
