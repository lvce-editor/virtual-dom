import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

export const getDevToolsWebSocketUrl = async (
  browserProfilePath: string,
  timeout = 5000,
): Promise<string> => {
  const deadline = Date.now() + timeout
  while (true) {
    try {
      const content = await readFile(
        join(browserProfilePath, 'DevToolsActivePort'),
        'utf8',
      )
      const [port, path] = content.trim().split('\n')
      if (port && path) {
        return `ws://127.0.0.1:${port}${path}`
      }
    } catch (error) {
      if (
        !(error instanceof Error) ||
        !('code' in error) ||
        error.code !== 'ENOENT'
      ) {
        throw error
      }
    }
    if (Date.now() >= deadline) {
      throw new Error('Timed out waiting for a valid DevToolsActivePort file')
    }
    await setTimeout(25)
  }
}
