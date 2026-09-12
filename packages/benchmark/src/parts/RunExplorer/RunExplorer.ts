import { explorerAllowedFailures } from '../AllowedFailures/AllowedFailures.ts'
import { getExplorerViewTests } from '../ExplorerView/ExplorerView.ts'
import { runDetailedBenchmark } from '../RunDetailed/RunDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: explorerAllowedFailures,
  getTests: getExplorerViewTests,
  outputPath: 'detailed-benchmark',
})
