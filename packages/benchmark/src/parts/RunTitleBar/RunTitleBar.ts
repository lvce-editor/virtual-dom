import { titleBarAllowedFailures } from '../AllowedFailures/AllowedFailures.ts'
import { runDetailedBenchmark } from '../RunDetailed/RunDetailed.ts'
import { getTitleBarWorkerTests } from '../TitleBarWorker/TitleBarWorker.ts'

await runDetailedBenchmark({
  allowedFailures: titleBarAllowedFailures,
  getTests: getTitleBarWorkerTests,
  outputPath: 'title-bar-benchmark',
})
