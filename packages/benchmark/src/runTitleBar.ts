import { titleBarAllowedFailures } from './allowedFailures.ts'
import { runDetailedBenchmark } from './runDetailed.ts'
import { getTitleBarWorkerTests } from './titleBarWorker.ts'

await runDetailedBenchmark({
  allowedFailures: titleBarAllowedFailures,
  getTests: getTitleBarWorkerTests,
  outputPath: 'title-bar-benchmark',
})
