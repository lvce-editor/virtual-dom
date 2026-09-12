import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const staticServerConfigPath = fileURLToPath(
  import.meta.resolve('@lvce-editor/static-server/config.json'),
)
const sharedProcessPackagePath = fileURLToPath(
  import.meta.resolve('@lvce-editor/shared-process/package.json'),
)
const sharedProcessConfigPath = join(
  dirname(sharedProcessPackagePath),
  'config.json',
)

export const prepareAboutViewServer = async (): Promise<void> => {
  const content = await readFile(staticServerConfigPath, 'utf8')
  const config = JSON.parse(content) as Record<string, unknown>
  // about-view v7.8.0 normally runs with server 0.87.0, whose config has no date.
  delete config.date
  await writeFile(
    sharedProcessConfigPath,
    `${JSON.stringify(config, null, 2)}\n`,
  )
}
