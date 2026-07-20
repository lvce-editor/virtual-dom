import { runDetailedBenchmark } from './runDetailed.ts'
import { getTitleBarWorkerTests } from './titleBarWorker.ts'

await runDetailedBenchmark({
  getTests: getTitleBarWorkerTests,
  outputPath: 'title-bar-benchmark',
})
