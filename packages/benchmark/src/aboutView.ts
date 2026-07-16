import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getAboutViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: '6e92dde363c4c04a60f2eadd258121aac29dd9ea',
    defaultRef: 'v7.8.0',
    downloadRoot: join(temporaryRoot, 'about-view'),
    id: 'about-view',
    label: 'About',
    localPath: process.env.ABOUT_VIEW_PATH,
    ref: process.env.ABOUT_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/about-view.git',
    temporaryRoot,
  })
}
