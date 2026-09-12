import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

export const getDevToolsWebSocketUrl = async (
  browserProfilePath: string,
  timeout = 10_000,
): Promise<string> => {
  const filePath = join(browserProfilePath, 'DevToolsActivePort')
  const deadline = performance.now() + timeout
  while (true) {
    try {
      const content = await readFile(filePath, 'utf8')
      const [port, path] = content.trim().split(/\r?\n/)
      if (port && path) {
        return `ws://127.0.0.1:${port}${path}`
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }
    const remaining = deadline - performance.now()
    if (remaining <= 0) {
      throw new Error(`Timed out waiting for Chrome to write ${filePath}`)
    }
    // Playwright's pipe can be ready before Chromium writes its TCP endpoint.
    await setTimeout(Math.min(50, remaining))
  }
}
