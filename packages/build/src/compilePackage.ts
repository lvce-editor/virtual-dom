import { execa } from 'execa'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join, posix } from 'node:path'
import { root } from './root.ts'

type PackageName = 'virtual-dom' | 'virtual-dom-worker'

type PackageBuildTsConfig = {
  extends: string
  compilerOptions: {
    composite: boolean
    noEmit: boolean
    emitDeclarationOnly: boolean
    declaration: boolean
    outDir: string
    rootDir: string
    rewriteRelativeImportExtensions: boolean
  }
  include: string[]
}

export const getPackageBuildTsConfigPath = ({
  packageName,
}: {
  packageName: PackageName
}): string => {
  return posix.join('.tmp', `build-${packageName}.tsconfig.json`)
}

export const getPackageBuildTsConfig = ({
  packageName,
}: {
  packageName: PackageName
}): PackageBuildTsConfig => {
  return {
    extends: `../packages/${packageName}/tsconfig.json`,
    compilerOptions: {
      composite: false,
      noEmit: false,
      emitDeclarationOnly: false,
      declaration: true,
      outDir: `../dist/${packageName}/dist`,
      rootDir: `../packages/${packageName}/src`,
      rewriteRelativeImportExtensions: true,
    },
    include: [`../packages/${packageName}/src`],
  }
}

export const buildPackage = async ({
  packageName,
}: {
  packageName: PackageName
}): Promise<void> => {
  await mkdir(join(root, 'dist', packageName, 'dist'), { recursive: true })
  await mkdir(join(root, '.tmp'), { recursive: true })

  const tsConfigPath = getPackageBuildTsConfigPath({ packageName })
  const tsConfig = getPackageBuildTsConfig({ packageName })

  await writeFile(
    join(root, tsConfigPath),
    JSON.stringify(tsConfig, null, 2) + '\n',
  )

  try {
    const { exitCode, stderr, stdout } = await execa(
      'npx',
      ['tsc', '--project', tsConfigPath],
      {
        cwd: root,
        reject: false,
      },
    )

    if (exitCode) {
      throw new Error(`Failed to build ${packageName}\n${stderr || stdout}`)
    }
  } finally {
    await rm(join(root, tsConfigPath), { force: true })
  }
}
