import { fork, type ChildProcess } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { createServer } from 'node:net'
import { fileURLToPath } from 'node:url'

const serverPath = fileURLToPath(
  import.meta.resolve('@lvce-editor/server/bin/server.js'),
)
const serverPackageJsonPath = fileURLToPath(
  import.meta.resolve('@lvce-editor/server/package.json'),
)

const getPort = async (): Promise<number> => {
  const server = createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolve()
    })
  })
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Failed to allocate a server port')
  }
  const { port } = address
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolve()
    })
  })
  return port
}

const waitForReady = async (child: ChildProcess): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup()
      reject(new Error('Timed out waiting for @lvce-editor/server'))
    }, 30_000)
    const cleanup = (): void => {
      clearTimeout(timeout)
      child.off('error', handleError)
      child.off('exit', handleExit)
      child.off('message', handleMessage)
    }
    const handleError = (error: Error): void => {
      cleanup()
      reject(error)
    }
    const handleExit = (code: number | null): void => {
      cleanup()
      reject(
        new Error(`@lvce-editor/server exited before it was ready (${code})`),
      )
    }
    const handleMessage = (): void => {
      cleanup()
      resolve()
    }
    child.once('error', handleError)
    child.once('exit', handleExit)
    child.once('message', handleMessage)
  })
}

const waitForHttp = async (child: ChildProcess, url: string): Promise<void> => {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    if (child.exitCode !== null || child.signalCode !== null) {
      throw new Error('@lvce-editor/server exited before accepting requests')
    }
    try {
      const response = await fetch(url, {
        signal: AbortSignal.timeout(1000),
      })
      await response.body?.cancel()
      return
    } catch {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 100)
      })
    }
  }
  throw new Error(
    'Timed out waiting for @lvce-editor/server to accept requests',
  )
}

const closeChild = async (child: ChildProcess): Promise<void> => {
  if (child.exitCode !== null || child.signalCode !== null) {
    return
  }
  const exited = new Promise<void>((resolve) => {
    child.once('exit', () => resolve())
  })
  child.kill('SIGINT')
  const waitForExit = async (): Promise<true> => {
    await exited
    return true
  }
  const graceful = await Promise.race([
    waitForExit(),
    new Promise<false>((resolve) => {
      setTimeout(resolve, 10_000, false)
    }),
  ])
  if (!graceful) {
    child.kill('SIGKILL')
    await exited
  }
}

const getServerVersion = async (): Promise<string> => {
  const content = await readFile(serverPackageJsonPath, 'utf8')
  const packageJson = JSON.parse(content) as { readonly version?: unknown }
  return typeof packageJson.version === 'string'
    ? packageJson.version
    : 'unknown'
}

export interface DetailedBenchmarkServer {
  readonly close: () => Promise<void>
  readonly url: string
  readonly version: string
}

export const startDetailedBenchmarkServer = async (
  testPath: string,
): Promise<DetailedBenchmarkServer> => {
  const port = await getPort()
  const child = fork(serverPath, {
    env: {
      ...process.env,
      PORT: String(port),
      TEST_PATH: testPath,
    },
    stdio: 'inherit',
  })
  await waitForReady(child)
  const url = `http://localhost:${port}`
  await waitForHttp(child, url)
  return {
    close: () => closeChild(child),
    url,
    version: await getServerVersion(),
  }
}
