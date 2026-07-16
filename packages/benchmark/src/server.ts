import type { AddressInfo } from 'node:net'
import { readFile } from 'node:fs/promises'
import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http'
import { extname, join, normalize, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureBuild } from './ensureBuild.ts'

const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const root = join(packageRoot, '../..')
const appRoot = join(packageRoot, 'app')

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
])

const send = (
  response: ServerResponse,
  statusCode: number,
  body: Buffer | string,
  contentType = 'text/plain; charset=utf-8',
): void => {
  response.writeHead(statusCode, {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  })
  response.end(body)
}

const isInside = (parent: string, candidate: string): boolean => {
  const path = relative(parent, candidate)
  return path === '' || (!path.startsWith('..') && !path.startsWith('/'))
}

const resolveInside = (parent: string, path: string): string | undefined => {
  const candidate = resolve(parent, normalize(path))
  return isInside(parent, candidate) ? candidate : undefined
}

const tryServe = async (
  response: ServerResponse,
  parent: string,
  path: string,
): Promise<boolean> => {
  const filePath = resolveInside(parent, path)
  if (!filePath) {
    return false
  }
  try {
    const content = await readFile(filePath)
    send(
      response,
      200,
      content,
      contentTypes.get(extname(filePath)) ?? 'application/octet-stream',
    )
    return true
  } catch {
    return false
  }
}

const serveNodeModule = async (
  response: ServerResponse,
  path: string,
): Promise<boolean> => {
  const candidates = [
    join(root, 'node_modules'),
    join(root, 'packages', 'virtual-dom', 'node_modules'),
    join(root, 'packages', 'virtual-dom-worker', 'node_modules'),
  ]
  for (const candidate of candidates) {
    if (await tryServe(response, candidate, path)) {
      return true
    }
  }
  return false
}

const handleRequest = async (
  request: IncomingMessage,
  response: ServerResponse,
): Promise<void> => {
  try {
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
    const path = decodeURIComponent(requestUrl.pathname)

    if (path.startsWith('/dist/')) {
      if (await tryServe(response, root, path.slice(1))) {
        return
      }
    } else if (path.startsWith('/node_modules/')) {
      if (
        await serveNodeModule(response, path.slice('/node_modules/'.length))
      ) {
        return
      }
    } else {
      const appPath = path === '/' ? 'index.html' : path.slice(1)
      if (await tryServe(response, appRoot, appPath)) {
        return
      }
    }

    send(response, 404, 'Not Found')
  } catch (error) {
    send(
      response,
      500,
      error instanceof Error ? error.message : 'Internal Server Error',
    )
  }
}

const listen = async (server: Server): Promise<void> => {
  await new Promise<void>((resolvePromise, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', reject)
      resolvePromise()
    })
  })
}

const close = async (server: Server): Promise<void> => {
  await new Promise<void>((resolvePromise, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
        return
      }
      resolvePromise()
    })
  })
}

export interface BenchmarkServer {
  readonly close: () => Promise<void>
  readonly url: string
}

export const startServer = async (): Promise<BenchmarkServer> => {
  await ensureBuild()
  const server = createServer((request, response) => {
    void handleRequest(request, response)
  })
  await listen(server)
  const address = server.address() as AddressInfo
  return {
    close: () => close(server),
    url: `http://127.0.0.1:${address.port}`,
  }
}
