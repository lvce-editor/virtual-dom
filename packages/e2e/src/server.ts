import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ensureBuild } from './ensureBuild.js'

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

const server = createServer(async (req, res) => {
  try {
    const url = req.url === '/' ? '/index.html' : req.url
    const filePath = join(root, 'packages', 'e2e', 'src', 'fixtures', url)

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

const start = async (): Promise<void> => {
  await ensureBuild()
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
