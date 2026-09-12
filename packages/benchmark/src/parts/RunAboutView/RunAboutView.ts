import { getAboutViewTests } from '../AboutView/AboutView.ts'
import { aboutAllowedFailures } from '../AllowedFailures/AllowedFailures.ts'
import { prepareAboutViewServer } from '../PrepareAboutViewServer/PrepareAboutViewServer.ts'
import { runDetailedBenchmark } from '../RunDetailed/RunDetailed.ts'

await prepareAboutViewServer()

await runDetailedBenchmark({
  allowedFailures: aboutAllowedFailures,
  getTests: getAboutViewTests,
  outputPath: 'about-view-benchmark',
})
