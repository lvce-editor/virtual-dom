import { getAboutViewTests } from './aboutView.ts'
import { aboutAllowedFailures } from './allowedFailures.ts'
import { prepareAboutViewServer } from './prepareAboutViewServer.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await prepareAboutViewServer()

await runDetailedBenchmark({
  allowedFailures: aboutAllowedFailures,
  getTests: getAboutViewTests,
  outputPath: 'about-view-benchmark',
})
