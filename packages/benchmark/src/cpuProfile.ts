import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const virtualDomFunctionNames = new Set([
  'addNavigationPatches',
  'addNewChildren',
  'addRemainingNewNodes',
  'addTree',
  'applyAttributeChanges',
  'applyMutationPatch',
  'applyPatch',
  'applyPendingPatches',
  'arrayToTree',
  'attachEvent',
  'compareNodes',
  'detachEvent',
  'diff',
  'diffChildren',
  'diffExistingChild',
  'diffRootNode',
  'diffTree',
  'diffTrees',
  'enterChildLevel',
  'handleNavigateChild',
  'handleNavigateParent',
  'handleNavigateSibling',
  'handleNavigationPatch',
  'handleSetReferenceNodeUid',
  'hasAttributeChanges',
  'hasPendingNavigateChild',
  'navigateToChild',
  'navigateToParent',
  'removeOldChildren',
  'removeProp',
  'removeRemainingOldNodes',
  'removeTrailingNavigationPatches',
  'renderDomElement',
  'renderDomTextNode',
  'renderIncremental',
  'renderInternal',
  'renderInto',
  'renderReferenceNode',
  'replaceMismatchedNode',
  'replaceTree',
  'restoreFocus',
  'setProp',
  'setProps',
  'setStyle',
  'syncAncestorNavigation',
  'updateTextNode',
])

interface CallFrame {
  readonly codeType: string
  readonly columnNumber: number
  readonly functionName: string
  readonly lineNumber: number
  readonly url: string
}

interface ProfileNode {
  readonly callFrame: CallFrame
  readonly children: readonly number[]
  readonly id: number
}

interface CpuProfile {
  readonly endTime: number
  readonly nodes: readonly ProfileNode[]
  readonly samples: readonly number[]
  readonly startTime: number
  readonly timeDeltas: readonly number[]
}

interface TargetInfo {
  readonly targetId: string
  readonly title: string
  readonly type: string
  readonly url: string
}

interface ProfiledTarget {
  readonly sessionId: string
  readonly targetInfo: TargetInfo
}

interface CapturedProfile {
  readonly contextName: string
  readonly file: string
  readonly profile: CpuProfile
  readonly targetInfo: TargetInfo
}

interface MutableHotspot {
  readonly contexts: Set<string>
  readonly frame: CallFrame
  inclusiveMicroseconds: number
  samples: number
  selfMicroseconds: number
}

interface CdpMessage {
  readonly error?: {
    readonly message?: string
  }
  readonly id?: number
  readonly method?: string
  readonly params?: Record<string, unknown>
  readonly result?: Record<string, unknown>
}

interface PendingRequest {
  readonly reject: (error: Error) => void
  readonly resolve: (value: Record<string, unknown>) => void
}

export interface CpuProfileContext {
  readonly file: string
  readonly name: string
  readonly sampleCount: number
  readonly targetType: string
  readonly totalProfiledMs: number
  readonly url: string
  readonly virtualDomInclusiveMs: number
}

export interface CpuProfileHotspot {
  readonly columnNumber: number
  readonly contexts: readonly string[]
  readonly functionName: string
  readonly inclusiveMs: number
  readonly lineNumber: number
  readonly samples: number
  readonly selfMs: number
  readonly url: string
}

export interface CpuProfileAnalysis {
  readonly contexts: readonly CpuProfileContext[]
  readonly filter: {
    readonly functionNames: readonly string[]
    readonly urlSubstrings: readonly string[]
  }
  readonly hotspots: readonly CpuProfileHotspot[]
  readonly profileCount: number
  readonly sampleCount: number
  readonly totalProfiledMs: number
  readonly virtualDomInclusiveMs: number
  readonly virtualDomSelfMs: number
}

export interface CpuProfileCaptureResult {
  readonly analysis: CpuProfileAnalysis
  readonly detachedTargetCount: number
  readonly profiles: readonly {
    readonly contextName: string
    readonly file: string
    readonly sampleCount: number
    readonly targetType: string
    readonly url: string
  }[]
}

export interface CpuProfileCapture {
  readonly stop: () => Promise<CpuProfileCaptureResult>
}

class CdpConnection {
  static async connect(url: string): Promise<CdpConnection> {
    const socket = new WebSocket(url)
    await new Promise<void>((resolve, reject) => {
      const handleOpen = (): void => {
        cleanup()
        resolve()
      }
      const handleError = (): void => {
        cleanup()
        reject(new Error('Failed to connect to Chrome DevTools'))
      }
      const cleanup = (): void => {
        socket.removeEventListener('open', handleOpen)
        socket.removeEventListener('error', handleError)
      }
      socket.addEventListener('open', handleOpen)
      socket.addEventListener('error', handleError)
    })
    return new CdpConnection(socket)
  }

  private nextId = 1
  private readonly pending = new Map<number, PendingRequest>()
  private readonly socket: WebSocket
  private readonly listeners = new Set<
    (method: string, params: Record<string, unknown>) => void
  >()

  private constructor(socket: WebSocket) {
    this.socket = socket
    socket.addEventListener('message', (event) => {
      this.handleMessage(event.data)
    })
    socket.addEventListener('close', () => {
      for (const request of this.pending.values()) {
        request.reject(new Error('Chrome DevTools connection closed'))
      }
      this.pending.clear()
    })
  }

  private handleMessage(data: unknown): void {
    let text = ''
    if (typeof data === 'string') {
      text = data
    } else if (Buffer.isBuffer(data)) {
      text = data.toString()
    }
    if (!text) {
      return
    }
    const message = JSON.parse(text) as CdpMessage
    if (message.id !== undefined) {
      const pending = this.pending.get(message.id)
      if (!pending) {
        return
      }
      this.pending.delete(message.id)
      if (message.error) {
        pending.reject(
          new Error(message.error.message || 'Chrome DevTools command failed'),
        )
      } else {
        pending.resolve(message.result ?? {})
      }
      return
    }
    if (message.method) {
      for (const listener of this.listeners) {
        listener(message.method, message.params ?? {})
      }
    }
  }

  close(): void {
    this.socket.close()
  }

  onEvent(
    listener: (method: string, params: Record<string, unknown>) => void,
  ): void {
    this.listeners.add(listener)
  }

  async send(
    method: string,
    params: Record<string, unknown> = {},
    sessionId?: string,
  ): Promise<Record<string, unknown>> {
    const id = this.nextId++
    const response = new Promise<Record<string, unknown>>((resolve, reject) => {
      this.pending.set(id, { reject, resolve })
    })
    this.socket.send(
      JSON.stringify({
        id,
        method,
        params,
        ...(sessionId && { sessionId }),
      }),
    )
    return response
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const getArray = (value: Record<string, unknown>, key: string): unknown[] => {
  const candidate = value[key]
  return Array.isArray(candidate) ? candidate : []
}

const getNumber = (
  value: Record<string, unknown>,
  key: string,
  fallback = 0,
): number => {
  const candidate = value[key]
  return typeof candidate === 'number' && Number.isFinite(candidate)
    ? candidate
    : fallback
}

const getString = (
  value: Record<string, unknown>,
  key: string,
  fallback = '',
): string => {
  const candidate = value[key]
  return typeof candidate === 'string' ? candidate : fallback
}

const parseTargetInfo = (value: unknown): TargetInfo | undefined => {
  if (!isRecord(value)) {
    return undefined
  }
  const targetId = getString(value, 'targetId')
  if (!targetId) {
    return undefined
  }
  return {
    targetId,
    title: getString(value, 'title'),
    type: getString(value, 'type', 'unknown'),
    url: getString(value, 'url'),
  }
}

const parseCallFrame = (value: unknown): CallFrame => {
  const frame = isRecord(value) ? value : {}
  return {
    codeType: getString(frame, 'codeType'),
    columnNumber: getNumber(frame, 'columnNumber'),
    functionName: getString(frame, 'functionName') || '(anonymous)',
    lineNumber: getNumber(frame, 'lineNumber'),
    url: getString(frame, 'url'),
  }
}

const parseProfileNode = (value: unknown): ProfileNode | undefined => {
  if (!isRecord(value)) {
    return undefined
  }
  const id = getNumber(value, 'id', NaN)
  if (!Number.isFinite(id)) {
    return undefined
  }
  return {
    callFrame: parseCallFrame(value.callFrame),
    children: getArray(value, 'children').filter(
      (child): child is number => typeof child === 'number',
    ),
    id,
  }
}

const parseCpuProfile = (value: unknown): CpuProfile => {
  if (!isRecord(value)) {
    throw new TypeError('Expected a Chrome CPU profile object')
  }
  return {
    endTime: getNumber(value, 'endTime'),
    nodes: getArray(value, 'nodes')
      .map(parseProfileNode)
      .filter((node): node is ProfileNode => Boolean(node)),
    samples: getArray(value, 'samples').filter(
      (sample): sample is number => typeof sample === 'number',
    ),
    startTime: getNumber(value, 'startTime'),
    timeDeltas: getArray(value, 'timeDeltas').filter(
      (delta): delta is number => typeof delta === 'number',
    ),
  }
}

const roundMilliseconds = (microseconds: number): number => {
  return Math.round(microseconds) / 1000
}

const getContextName = (targetInfo: TargetInfo): string => {
  const detail = targetInfo.title || targetInfo.url
  return detail ? `${targetInfo.type}: ${detail}` : targetInfo.type
}

const isVirtualDomFrame = (frame: CallFrame): boolean => {
  return (
    frame.url.includes('/virtual-dom/') ||
    frame.url.includes('/virtual-dom-worker/') ||
    virtualDomFunctionNames.has(frame.functionName)
  )
}

const getParentMap = (
  nodes: readonly ProfileNode[],
): ReadonlyMap<number, number> => {
  const parents = new Map<number, number>()
  for (const node of nodes) {
    for (const child of node.children) {
      parents.set(child, node.id)
    }
  }
  return parents
}

const getStack = (
  nodes: ReadonlyMap<number, ProfileNode>,
  parents: ReadonlyMap<number, number>,
  leafId: number,
): readonly ProfileNode[] => {
  const stack: ProfileNode[] = []
  const visited = new Set<number>()
  let node = nodes.get(leafId)
  while (node && !visited.has(node.id)) {
    stack.push(node)
    visited.add(node.id)
    const parent = parents.get(node.id)
    node = parent === undefined ? undefined : nodes.get(parent)
  }
  return stack
}

const getHotspotKey = (frame: CallFrame): string => {
  return [
    frame.functionName,
    frame.url,
    frame.lineNumber,
    frame.columnNumber,
  ].join(':')
}

interface SampleAnalysis {
  readonly processed: boolean
  readonly virtualDomInclusive: boolean
  readonly virtualDomSelf: boolean
}

const analyzeSample = ({
  contextName,
  delta,
  hotspots,
  leafId,
  nodes,
  parents,
}: {
  readonly contextName: string
  readonly delta: number
  readonly hotspots: Map<string, MutableHotspot>
  readonly leafId: number
  readonly nodes: ReadonlyMap<number, ProfileNode>
  readonly parents: ReadonlyMap<number, number>
}): SampleAnalysis => {
  const stack = getStack(nodes, parents, leafId)
  const leaf = stack[0]
  if (!leaf) {
    return {
      processed: false,
      virtualDomInclusive: false,
      virtualDomSelf: false,
    }
  }
  const matchedNodes = stack.filter((node) => isVirtualDomFrame(node.callFrame))
  for (const node of matchedNodes) {
    const key = getHotspotKey(node.callFrame)
    const hotspot = hotspots.get(key) ?? {
      contexts: new Set<string>(),
      frame: node.callFrame,
      inclusiveMicroseconds: 0,
      samples: 0,
      selfMicroseconds: 0,
    }
    hotspot.contexts.add(contextName)
    hotspot.inclusiveMicroseconds += delta
    hotspots.set(key, hotspot)
  }
  const virtualDomSelf = isVirtualDomFrame(leaf.callFrame)
  if (virtualDomSelf) {
    const hotspot = hotspots.get(getHotspotKey(leaf.callFrame))
    if (hotspot) {
      hotspot.samples++
      hotspot.selfMicroseconds += delta
    }
  }
  return {
    processed: true,
    virtualDomInclusive: matchedNodes.length > 0,
    virtualDomSelf,
  }
}

interface ProfileAnalysis {
  readonly context: CpuProfileContext
  readonly sampleCount: number
  readonly totalMicroseconds: number
  readonly virtualDomInclusiveMicroseconds: number
  readonly virtualDomSelfMicroseconds: number
}

const analyzeProfile = (
  captured: CapturedProfile,
  hotspots: Map<string, MutableHotspot>,
): ProfileAnalysis => {
  const { contextName, file, profile, targetInfo } = captured
  const nodes = new Map(profile.nodes.map((node) => [node.id, node]))
  const parents = getParentMap(profile.nodes)
  const length = Math.min(profile.samples.length, profile.timeDeltas.length)
  let sampleCount = 0
  let totalMicroseconds = 0
  let virtualDomInclusiveMicroseconds = 0
  let virtualDomSelfMicroseconds = 0

  for (let index = 0; index < length; index++) {
    const delta = profile.timeDeltas[index]
    if (delta >= 0) {
      const analysis = analyzeSample({
        contextName,
        delta,
        hotspots,
        leafId: profile.samples[index],
        nodes,
        parents,
      })
      if (analysis.processed) {
        sampleCount++
        totalMicroseconds += delta
        if (analysis.virtualDomInclusive) {
          virtualDomInclusiveMicroseconds += delta
        }
        if (analysis.virtualDomSelf) {
          virtualDomSelfMicroseconds += delta
        }
      }
    }
  }

  return {
    context: {
      file,
      name: contextName,
      sampleCount: length,
      targetType: targetInfo.type,
      totalProfiledMs: roundMilliseconds(totalMicroseconds),
      url: targetInfo.url,
      virtualDomInclusiveMs: roundMilliseconds(virtualDomInclusiveMicroseconds),
    },
    sampleCount,
    totalMicroseconds,
    virtualDomInclusiveMicroseconds,
    virtualDomSelfMicroseconds,
  }
}

export const analyzeCpuProfiles = (
  profiles: readonly CapturedProfile[],
): CpuProfileAnalysis => {
  const hotspots = new Map<string, MutableHotspot>()
  const contexts: CpuProfileContext[] = []
  let sampleCount = 0
  let totalProfiledMicroseconds = 0
  let virtualDomInclusiveMicroseconds = 0
  let virtualDomSelfMicroseconds = 0

  for (const captured of profiles) {
    const analysis = analyzeProfile(captured, hotspots)
    contexts.push(analysis.context)
    sampleCount += analysis.sampleCount
    totalProfiledMicroseconds += analysis.totalMicroseconds
    virtualDomInclusiveMicroseconds += analysis.virtualDomInclusiveMicroseconds
    virtualDomSelfMicroseconds += analysis.virtualDomSelfMicroseconds
  }

  return {
    contexts: contexts.toSorted(
      (left, right) => right.virtualDomInclusiveMs - left.virtualDomInclusiveMs,
    ),
    filter: {
      functionNames: [...virtualDomFunctionNames].toSorted((left, right) =>
        left.localeCompare(right),
      ),
      urlSubstrings: ['/virtual-dom/', '/virtual-dom-worker/'],
    },
    hotspots: Array.from(hotspots.values(), (hotspot) => ({
      columnNumber: hotspot.frame.columnNumber,
      contexts: [...hotspot.contexts].toSorted((left, right) =>
        left.localeCompare(right),
      ),
      functionName: hotspot.frame.functionName,
      inclusiveMs: roundMilliseconds(hotspot.inclusiveMicroseconds),
      lineNumber: hotspot.frame.lineNumber,
      samples: hotspot.samples,
      selfMs: roundMilliseconds(hotspot.selfMicroseconds),
      url: hotspot.frame.url,
    })).toSorted(
      (left, right) =>
        right.selfMs - left.selfMs || right.inclusiveMs - left.inclusiveMs,
    ),
    profileCount: profiles.length,
    sampleCount,
    totalProfiledMs: roundMilliseconds(totalProfiledMicroseconds),
    virtualDomInclusiveMs: roundMilliseconds(virtualDomInclusiveMicroseconds),
    virtualDomSelfMs: roundMilliseconds(virtualDomSelfMicroseconds),
  }
}

const settle = async (tasks: Set<Promise<void>>): Promise<void> => {
  while (tasks.size > 0) {
    await Promise.allSettled(tasks)
  }
}

const getFileName = (targetInfo: TargetInfo, index: number): string => {
  const type = targetInfo.type.replaceAll(/[^a-z0-9]+/gi, '-').toLowerCase()
  return `${String(index + 1).padStart(2, '0')}-${type || 'context'}.cpuprofile`
}

export const startCpuProfile = async ({
  outputPath,
  samplingInterval,
  webSocketUrl,
}: {
  readonly outputPath: string
  readonly samplingInterval: number
  readonly webSocketUrl: string
}): Promise<CpuProfileCapture> => {
  const connection = await CdpConnection.connect(webSocketUrl)
  const targets = new Map<string, ProfiledTarget>()
  const targetSessions = new Map<string, string>()
  const setupTasks = new Set<Promise<void>>()
  let detachedTargetCount = 0
  let stopping = false

  const sendMayFail = async (
    method: string,
    params: Record<string, unknown>,
    sessionId: string,
  ): Promise<void> => {
    try {
      await connection.send(method, params, sessionId)
    } catch {
      // Targets can detach while profiler setup is still in flight.
    }
  }

  const setupTarget = async (
    sessionId: string,
    targetInfo: TargetInfo,
  ): Promise<void> => {
    if (stopping) {
      await sendMayFail('Runtime.runIfWaitingForDebugger', {}, sessionId)
      return
    }
    try {
      await connection.send('Profiler.enable', {}, sessionId)
      await connection.send(
        'Profiler.setSamplingInterval',
        { interval: samplingInterval },
        sessionId,
      )
      await connection.send('Profiler.start', {}, sessionId)
      targets.set(sessionId, { sessionId, targetInfo })
      targetSessions.set(targetInfo.targetId, sessionId)
      await sendMayFail(
        'Target.setAutoAttach',
        {
          autoAttach: true,
          flatten: true,
          waitForDebuggerOnStart: true,
        },
        sessionId,
      )
    } finally {
      await sendMayFail('Runtime.runIfWaitingForDebugger', {}, sessionId)
    }
  }

  const handleAttached = (params: Record<string, unknown>): void => {
    const sessionId = getString(params, 'sessionId')
    const targetInfo = parseTargetInfo(params.targetInfo)
    if (!sessionId || !targetInfo) {
      return
    }
    const task = setupTarget(sessionId, targetInfo)
    setupTasks.add(task)
    void task.finally(() => {
      setupTasks.delete(task)
    })
  }

  const handleDetached = (params: Record<string, unknown>): void => {
    const sessionId = getString(params, 'sessionId')
    const target = sessionId ? targets.get(sessionId) : undefined
    if (target) {
      targetSessions.delete(target.targetInfo.targetId)
    }
    if (sessionId && targets.delete(sessionId)) {
      detachedTargetCount++
    }
  }

  const handleTargetInfoChanged = (params: Record<string, unknown>): void => {
    const targetInfo = parseTargetInfo(params.targetInfo)
    const sessionId = targetInfo
      ? targetSessions.get(targetInfo.targetId)
      : undefined
    if (targetInfo && sessionId && targets.has(sessionId)) {
      targets.set(sessionId, { sessionId, targetInfo })
    }
  }

  const refreshTargetInfo = async (
    target: ProfiledTarget,
  ): Promise<ProfiledTarget> => {
    try {
      const result = await connection.send('Target.getTargetInfo', {
        targetId: target.targetInfo.targetId,
      })
      const targetInfo = parseTargetInfo(result.targetInfo)
      return targetInfo ? { ...target, targetInfo } : target
    } catch {
      return target
    }
  }

  connection.onEvent((method, params) => {
    switch (method) {
      case 'Target.attachedToTarget':
        handleAttached(params)
        break
      case 'Target.detachedFromTarget':
        handleDetached(params)
        break
      case 'Target.targetInfoChanged':
        handleTargetInfoChanged(params)
        break
    }
  })

  await connection.send('Target.setAutoAttach', {
    autoAttach: true,
    filter: [
      { exclude: true, type: 'browser' },
      { exclude: true, type: 'tab' },
      {},
    ],
    flatten: true,
    waitForDebuggerOnStart: true,
  })
  await settle(setupTasks)

  const stop = async (): Promise<CpuProfileCaptureResult> => {
    stopping = true
    await settle(setupTasks)
    const capturedProfiles: CapturedProfile[] = []
    await mkdir(outputPath, { recursive: true })
    const activeTargets = await Promise.all(
      targets.values().map(refreshTargetInfo),
    )
    const stoppedProfiles = await Promise.all(
      activeTargets.map(async (target) => {
        try {
          const result = await connection.send(
            'Profiler.stop',
            {},
            target.sessionId,
          )
          return {
            rawProfile: result.profile,
            target,
          }
        } catch {
          detachedTargetCount++
          return undefined
        }
      }),
    )
    const availableProfiles = stoppedProfiles.filter(
      (profile) => profile !== undefined,
    )
    for (const [index, { rawProfile, target }] of availableProfiles.entries()) {
      try {
        const profile = parseCpuProfile(rawProfile)
        const fileName = getFileName(target.targetInfo, index)
        await writeFile(
          join(outputPath, fileName),
          `${JSON.stringify(rawProfile)}\n`,
        )
        capturedProfiles.push({
          contextName: getContextName(target.targetInfo),
          file: `./profiles/${fileName}`,
          profile,
          targetInfo: target.targetInfo,
        })
      } catch {
        detachedTargetCount++
      }
    }
    const analysis = analyzeCpuProfiles(capturedProfiles)
    const profiles = capturedProfiles.map((captured) => ({
      contextName: captured.contextName,
      file: captured.file,
      sampleCount: captured.profile.samples.length,
      targetType: captured.targetInfo.type,
      url: captured.targetInfo.url,
    }))
    await writeFile(
      join(outputPath, 'manifest.json'),
      `${JSON.stringify({ profiles }, null, 2)}\n`,
    )
    connection.close()
    return {
      analysis,
      detachedTargetCount,
      profiles,
    }
  }

  return {
    stop,
  }
}
