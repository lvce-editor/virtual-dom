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

const handleRequest = async (
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> => {
  try {
    const url = req.url === '/' ? '/index/' : req.url || '/index/'

    // Serve dist files for virtual-dom packages
    if (url.startsWith('/dist/')) {
      const filePath = join(root, url)
      try {
        const content = await readFile(filePath, 'utf8')
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
        res.end(content)
        return
      } catch {
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
        return
      }
    }

    // Serve node_modules packages (for unbundled dependencies like @lvce-editor/constants)
    if (url.startsWith('/node_modules/')) {
      // Try root node_modules first
      let filePath = join(root, url)
      try {
        const content = await readFile(filePath, 'utf8')
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
        res.end(content)
        return
      } catch {
        // Try package-specific node_modules (for lerna hoisted dependencies)
        filePath = join(root, 'packages', 'virtual-dom-worker', url)
        try {
          const content = await readFile(filePath, 'utf8')
          res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
          res.end(content)
          return
        } catch {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found')
          return
        }
      }
    }

    // Serve fixture files
    let filePath = join(root, 'packages', 'e2e', 'fixtures', url)

    // If URL ends with /, try to serve index.html from that directory
    if (url.endsWith('/')) {
      try {
        const stats = await stat(filePath)
        if (stats.isDirectory()) {
          filePath = join(filePath, 'index.html')
        }
      } catch {
        // Directory doesn't exist, will be handled below
      }
    }

    try {
      const content = await readFile(filePath, 'utf8')
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
      res.end(content)
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
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
