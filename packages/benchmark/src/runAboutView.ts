import { getAboutViewTests } from './aboutView.ts'
import { prepareAboutViewServer } from './prepareAboutViewServer.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await prepareAboutViewServer()

await runDetailedBenchmark({
  getTests: getAboutViewTests,
  outputPath: 'about-view-benchmark',
})
