import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureBuild } from './ensureBuild.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '../../..')

const PORT = 3000

const getMimeType = (path) => {
  if (path.endsWith('.html')) return 'text/html'
  if (path.endsWith('.js')) return 'application/javascript'
  if (path.endsWith('.css')) return 'text/css'
  if (path.endsWith('.json')) return 'application/json'
  return 'text/plain'
}

const server = createServer(async (req, res) => {
  try {
    let url = req.url === '/' ? '/index.html' : req.url || '/index.html'

    // Serve dist files for virtual-dom packages
    if (url.startsWith('/dist/')) {
      const filePath = join(root, url)
      try {
        const content = await readFile(filePath, 'utf8')
        res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
        res.end(content)
        return
      } catch (error) {
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
      } catch (error) {
        // Try package-specific node_modules (for lerna hoisted dependencies)
        filePath = join(
          root,
          'packages',
          'virtual-dom-worker',
          url,
        )
        try {
          const content = await readFile(filePath, 'utf8')
          res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
          res.end(content)
          return
        } catch (error2) {
          res.writeHead(404, { 'Content-Type': 'text/plain' })
          res.end('Not Found')
          return
        }
      }
    }

    // Serve fixture files
    const filePath = join(root, 'packages', 'e2e', 'fixtures', url)

    try {
      const content = await readFile(filePath, 'utf8')
      res.writeHead(200, { 'Content-Type': getMimeType(filePath) })
      res.end(content)
    } catch (error) {
      res.writeHead(404, { 'Content-Type': 'text/plain' })
      res.end('Not Found')
    }
  } catch (error) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Internal Server Error')
  }
})

const start = async () => {
  await ensureBuild()
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
