import { explorerAllowedFailures } from './allowedFailures.ts'
import { getExplorerViewTests } from './explorerView.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: explorerAllowedFailures,
  getTests: getExplorerViewTests,
  outputPath: 'detailed-benchmark',
})
