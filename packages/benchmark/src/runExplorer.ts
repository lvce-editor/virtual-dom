import { getExplorerViewTests } from './explorerView.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  getTests: getExplorerViewTests,
  outputPath: 'detailed-benchmark',
})
