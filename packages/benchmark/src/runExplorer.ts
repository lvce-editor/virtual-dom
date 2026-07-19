import { getExplorerViewTests } from './explorerView.ts'
import { runDetailedBenchmark } from './runDetailed.ts'

await runDetailedBenchmark({
  allowedFailures: [
    'viewlet.explorer-copy-and-paste-folder.js',
    'viewlet.explorer-copy-paste-collision-preserves-files.js',
    'viewlet.explorer-delete-open-file-keeps-editor-stable.js',
    'viewlet.explorer-drop-file-and-folder-empty-workspace.js',
    'viewlet.explorer-drop-folder-empty-workspace.js',
    'viewlet.explorer-drop-two-folders-empty-workspace.js',
    'viewlet.explorer-empty-workspace.js',
    'viewlet.explorer-rename-file-twice.js',
  ],
  getTests: getExplorerViewTests,
  outputPath: 'detailed-benchmark',
})
