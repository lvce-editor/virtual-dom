import { getExplorerViewTests } from './explorerView.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: [
    'viewlet.explorer-copy-and-paste-folder.js',
    'viewlet.explorer-copy-paste-collision-preserves-files.js',
    'viewlet.explorer-delete-open-file-keeps-editor-stable.js',
  ],
  getTests: getExplorerViewTests,
  outputPath: 'detailed-benchmark',
})
