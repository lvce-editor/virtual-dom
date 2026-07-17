import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { getStaticCommitRoot } from './staticServerPaths.ts'

const captureMarker = 'virtual-dom-message-benchmark-capture'
const legacyCaptureSetup = `// ${captureMarker}
const ____receivedMessages = [];
globalThis.____receivedMessages = ____receivedMessages;
const ____captureRendererWorkerMessage = event => {
  ____receivedMessages.push(event.data);
};
`
const captureSetup = `// ${captureMarker}
const ____receivedMessages = [];
const ____receivedMessageTimings = [];
globalThis.____receivedMessages = ____receivedMessages;
globalThis.____receivedMessageTimings = ____receivedMessageTimings;
const ____captureRendererWorkerMessage = event => {
  ____receivedMessageTimings.push({
    index: ____receivedMessages.length,
    receivedAt: performance.now(),
  });
  ____receivedMessages.push(event.data);
};
`
const launchAnchor = '  const result = await launchRendererWorker();'
const stateAssignmentRegex = / {2}state(?:\$\w+)?\.rpc = result\.value;/

export const addRendererMessageCapture = (content: string): string => {
  if (content.includes('globalThis.____receivedMessageTimings')) {
    return content
  }
  if (content.includes(legacyCaptureSetup)) {
    return content.replace(legacyCaptureSetup, () => captureSetup)
  }
  const launchIndex = content.indexOf(launchAnchor)
  if (launchIndex === -1) {
    throw new Error('Could not find the renderer worker launch')
  }
  const assignmentMatch = stateAssignmentRegex.exec(
    content.slice(launchIndex, launchIndex + 1000),
  )
  if (!assignmentMatch) {
    throw new Error('Could not find the renderer worker RPC assignment')
  }
  const assignmentIndex = launchIndex + assignmentMatch.index
  const assignment = assignmentMatch[0]
  const instrumentedAssignment = `  result.value.ipc.addEventListener('message', ____captureRendererWorkerMessage);
${assignment}`
  return `${captureSetup}${content.slice(0, assignmentIndex)}${instrumentedAssignment}${content.slice(assignmentIndex + assignment.length)}`
}

export const prepareRendererMessageCapture = async (): Promise<void> => {
  const staticCommitRoot = await getStaticCommitRoot()
  const rendererProcessPath = join(
    staticCommitRoot,
    'packages',
    'renderer-process',
    'dist',
    'rendererProcessMain.js',
  )
  const content = await readFile(rendererProcessPath, 'utf8')
  const instrumented = addRendererMessageCapture(content)
  if (instrumented !== content) {
    await writeFile(rendererProcessPath, instrumented)
  }
}
