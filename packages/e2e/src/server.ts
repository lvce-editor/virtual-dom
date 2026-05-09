import { readFile, stat } from 'node:fs/promises'
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureBuild } from './ensureBuild.ts'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '../../..')

const PORT = 3000

const getMimeType = (path: string): string => {
  if (path.endsWith('.html')) return 'text/html'
  if (path.endsWith('.js')) return 'application/javascript'
  if (path.endsWith('.css')) return 'text/css'
  if (path.endsWith('.json')) return 'application/json'
  return 'text/plain'
}

const sendResponse = (
  res: ServerResponse,
  statusCode: number,
  body: string,
  contentType = 'text/plain',
): void => {
  res.writeHead(statusCode, { 'Content-Type': contentType })
  res.end(body)
}

const tryServeFile = async (
  res: ServerResponse,
  filePath: string,
): Promise<boolean> => {
  try {
    const content = await readFile(filePath, 'utf8')
    sendResponse(res, 200, content, getMimeType(filePath))
    return true
  } catch {
    return false
  }
}

const serveFromCandidates = async (
  res: ServerResponse,
  filePaths: readonly string[],
): Promise<void> => {
  for (const filePath of filePaths) {
    if (await tryServeFile(res, filePath)) {
      return
    }
  }
  sendResponse(res, 404, 'Not Found')
}

const resolveFixturePath = async (url: string): Promise<string> => {
  const filePath = join(root, 'packages', 'e2e', 'fixtures', url)
  if (!url.endsWith('/')) {
    return filePath
  }
  try {
    const stats = await stat(filePath)
    if (stats.isDirectory()) {
      return join(filePath, 'index.html')
    }
  } catch {
    return filePath
  }
  return filePath
}

const handleDistRequest = async (
  url: string,
  res: ServerResponse,
): Promise<void> => {
  await serveFromCandidates(res, [join(root, url)])
}

const handleNodeModulesRequest = async (
  url: string,
  res: ServerResponse,
): Promise<void> => {
  await serveFromCandidates(res, [
    join(root, url),
    join(root, 'packages', 'virtual-dom-worker', url),
  ])
}

const handleFixtureRequest = async (
  url: string,
  res: ServerResponse,
): Promise<void> => {
  const filePath = await resolveFixturePath(url)
  if (await tryServeFile(res, filePath)) {
    return
  }
  sendResponse(res, 404, 'Not Found')
}

const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const url = req.url === '/' ? '/index/' : req.url || '/index/'

    if (url.startsWith('/dist/')) {
      await handleDistRequest(url, res)
      return
    }

    if (url.startsWith('/node_modules/')) {
      await handleNodeModulesRequest(url, res)
      return
    }

    await handleFixtureRequest(url, res)
  } catch {
    sendResponse(res, 500, 'Internal Server Error')
  }
}

const server = createServer((req, res): void => {
  void handleRequest(req, res)
})

const start = async (): Promise<void> => {
  await ensureBuild()
  server.listen(PORT, () => {
    process.stdout.write(`Server running at http://localhost:${PORT}\n`)
  })
}

try {
  await start()
} catch (error) {
  console.error('Failed to start server:', error)
  throw error
}
