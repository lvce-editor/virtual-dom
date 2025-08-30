import { execa } from 'execa'
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { bundleJs } from './bundleJs.js'
import { generateApiTypes } from './generateApiTypes.js'
import { root } from './root.js'

const dist = join(root, 'dist')

const readJson = async (path) => {
  const content = await readFile(path, 'utf8')
  return JSON.parse(content)
}

const writeJson = async (path, json) => {
  await writeFile(path, JSON.stringify(json, null, 2) + '\n')
}

const getGitTagFromGit = async () => {
  const { stdout, stderr, exitCode } = await execa(
    'git',
    ['describe', '--exact-match', '--tags'],
    {
      reject: false,
    },
  )
  if (exitCode) {
    if (
      exitCode === 128 &&
      stderr.startsWith('fatal: no tag exactly matches')
    ) {
      return '0.0.0-dev'
    }
    return '0.0.0-dev'
  }
  if (stdout.startsWith('v')) {
    return stdout.slice(1)
  }
  return stdout
}

const getVersion = async () => {
  const { env } = process
  const { RG_VERSION, GIT_TAG } = env
  if (RG_VERSION) {
    if (RG_VERSION.startsWith('v')) {
      return RG_VERSION.slice(1)
    }
    return RG_VERSION
  }
  if (GIT_TAG) {
    if (GIT_TAG.startsWith('v')) {
      return GIT_TAG.slice(1)
    }
    return GIT_TAG
  }
  return getGitTagFromGit()
}

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })
await mkdir(join(dist, 'virtual-dom'), { recursive: true })
await mkdir(join(dist, 'virtual-dom-worker'), { recursive: true })

const version = await getVersion()

for (const packageName of ['virtual-dom', 'virtual-dom-worker']) {
  const packageJson = await readJson(
    join(root, 'packages', packageName, 'package.json'),
  )

  delete packageJson.scripts
  delete packageJson.devDependencies
  delete packageJson.prettier
  delete packageJson.jest
  packageJson.version = version
  packageJson.main = 'dist/index.js'
  packageJson.types = 'dist/index.d.ts'

  await writeJson(join(dist, packageName, 'package.json'), packageJson)
  await cp(join(root, 'README.md'), join(dist, packageName, 'README.md'))
  await cp(join(root, 'LICENSE'), join(dist, packageName, 'LICENSE'))

  if (packageName === 'virtual-dom') {
    await bundleJs({
      inFile: `packages/${packageName}/src/index.ts`,
      outFile: `dist/${packageName}/dist/index.js`,
    })
  } else {
    await execa(`npx`, ['tsc', '-b'], {
      cwd: join(root, 'packages', 'virtual-dom-worker'),
    })
    const dirents = await readdir(join(root, '.tmp', 'tsc-dist'), {
      recursive: true,
    })
    const toRemove = dirents.filter((dirent) => dirent.endsWith('.d.ts'))
    await Promise.all(
      toRemove.map((item) => rm(join(root, '.tmp', 'tsc-dist', item))),
    )
    await cp(
      join(root, '.tmp', 'tsc-dist', 'src'),
      join(root, 'dist', 'virtual-dom-worker', 'dist'),
      { recursive: true },
    )
  }
}

await generateApiTypes({
  packageName: 'virtual-dom',
})

await generateApiTypes({
  packageName: 'virtual-dom-worker',
})
