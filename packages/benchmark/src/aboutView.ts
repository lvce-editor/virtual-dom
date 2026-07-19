import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBenchmarkTests, type BenchmarkTests } from './benchmarkTests.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const temporaryRoot = join(packageRoot, '.tmp')

export const getAboutViewTests = async (): Promise<BenchmarkTests> => {
  return getBenchmarkTests({
    defaultCommit: 'e793388bfec0c088f9cf48e9d99d207b91948cfc',
    defaultRef: 'v7.10.0',
    downloadRoot: join(temporaryRoot, 'about-view'),
    id: 'about-view',
    label: 'About',
    localPath: process.env.ABOUT_VIEW_PATH,
    ref: process.env.ABOUT_VIEW_REF,
    repositoryUrl: 'https://github.com/lvce-editor/about-view.git',
    temporaryRoot,
  })
}
