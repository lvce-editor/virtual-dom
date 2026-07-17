import type { Page } from 'playwright'
import { Buffer } from 'node:buffer'

export type JsonValue =
  | boolean
  | null
  | number
  | string
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue }

export interface VirtualDomMessageCall {
  readonly method: string
  readonly params: readonly JsonValue[]
}

export interface RendererMessageTiming {
  readonly index: number
  readonly receivedAt: number
}

interface MethodSummary {
  readonly count: number
  readonly jsonBytes: number
  readonly method: string
}

export interface RendererCommandSummary {
  readonly count: number
  readonly duplicateCss: number
  readonly emptyPatches: number
  readonly jsonBytes: number
  readonly methods: readonly MethodSummary[]
  readonly renderBatches: {
    readonly count: number
    readonly minIntervalMs: number | null
    readonly under16Ms: number
  }
}

export interface VirtualDomMessageSummary {
  readonly count: number
  readonly jsonBytes: number
  readonly methods: readonly MethodSummary[]
}

const virtualDomMethods = new Set([
  'Viewlet.setDom',
  'Viewlet.setDom2',
  'Viewlet.setPatches',
])
const batchedMethods = new Set([
  'Viewlet.executeCommands',
  'Viewlet.sendMultiple',
])
const nestedVirtualDomMethods = new Set(['setDom', 'setDom2', 'setPatches'])

const isRecord = (value: JsonValue): value is Record<string, JsonValue> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isJsonArray = (value: JsonValue | undefined): value is JsonValue[] => {
  return Array.isArray(value)
}

const getCallFromCommand = (
  command: readonly JsonValue[],
): VirtualDomMessageCall | undefined => {
  const [method, ...params] = command
  if (typeof method !== 'string') {
    return undefined
  }
  if (virtualDomMethods.has(method)) {
    return { method, params }
  }
  if (
    method === 'Viewlet.send' &&
    typeof params[1] === 'string' &&
    nestedVirtualDomMethods.has(params[1])
  ) {
    return {
      method: `Viewlet.${params[1]}`,
      params: [params[0] ?? null, ...params.slice(2)],
    }
  }
  return undefined
}

const getCallsFromMessage = (
  message: JsonValue,
): readonly VirtualDomMessageCall[] => {
  if (!isRecord(message) || typeof message.method !== 'string') {
    return []
  }
  const { method } = message
  const params = isJsonArray(message.params) ? message.params : []
  const directCall = getCallFromCommand([method, ...params])
  if (directCall) {
    return [directCall]
  }
  if (!batchedMethods.has(method) || !isJsonArray(params[0])) {
    return []
  }
  const commands = params[0]
  return commands.flatMap((command) => {
    if (!isJsonArray(command)) {
      return []
    }
    const call = getCallFromCommand(command)
    return call ? [call] : []
  })
}

export const getVirtualDomMessageCalls = (
  messages: readonly JsonValue[],
): readonly VirtualDomMessageCall[] => {
  return messages.flatMap(getCallsFromMessage)
}

const getJsonBytes = (value: JsonValue | VirtualDomMessageCall): number => {
  return Buffer.byteLength(JSON.stringify(value), 'utf8')
}

export const getReceivedMessageJsonBytes = (
  messages: readonly JsonValue[],
): number => {
  return getJsonBytes(messages)
}

export const getVirtualDomMessageSummary = (
  calls: readonly VirtualDomMessageCall[],
): VirtualDomMessageSummary => {
  const methods = new Map<string, { count: number; jsonBytes: number }>()
  let jsonBytes = 0
  for (const call of calls) {
    const callBytes = getJsonBytes(call)
    jsonBytes += callBytes
    const current = methods.get(call.method) ?? { count: 0, jsonBytes: 0 }
    methods.set(call.method, {
      count: current.count + 1,
      jsonBytes: current.jsonBytes + callBytes,
    })
  }
  return {
    count: calls.length,
    jsonBytes,
    methods: Array.from(methods, ([method, summary]) => ({
      method,
      ...summary,
    })).toSorted((left, right) => left.method.localeCompare(right.method)),
  }
}

const getRendererCommandsFromMessage = (
  message: JsonValue,
): readonly (readonly JsonValue[])[] => {
  if (!isRecord(message) || typeof message.method !== 'string') {
    return []
  }
  const params = isJsonArray(message.params) ? message.params : []
  if (batchedMethods.has(message.method) && isJsonArray(params[0])) {
    return params[0].filter(isJsonArray)
  }
  return [[message.method, ...params]]
}

const getStyleSheetKey = (id: JsonValue | undefined): string => {
  return `${typeof id}:${JSON.stringify(id)}`
}

const getRenderBatchSummary = (
  messages: readonly JsonValue[],
  timings: readonly RendererMessageTiming[],
): RendererCommandSummary['renderBatches'] => {
  const renderBatchIndexes = new Set<number>()
  for (let index = 0; index < messages.length; index++) {
    const message = messages[index]
    if (isRecord(message) && message.method === 'Viewlet.sendMultiple') {
      renderBatchIndexes.add(index)
    }
  }
  const receivedAt = timings
    .filter((timing) => renderBatchIndexes.has(timing.index))
    .map((timing) => timing.receivedAt)
  let minIntervalMs: number | null = null
  let under16Ms = 0
  for (let index = 1; index < receivedAt.length; index++) {
    const interval = receivedAt[index] - receivedAt[index - 1]
    minIntervalMs =
      minIntervalMs === null ? interval : Math.min(minIntervalMs, interval)
    if (interval < 16) {
      under16Ms++
    }
  }
  return {
    count: renderBatchIndexes.size,
    minIntervalMs,
    under16Ms,
  }
}

export const getRendererCommandSummary = (
  messages: readonly JsonValue[],
  timings: readonly RendererMessageTiming[],
): RendererCommandSummary => {
  const commands = messages.flatMap(getRendererCommandsFromMessage)
  const methods = new Map<string, { count: number; jsonBytes: number }>()
  const styleSheets = new Map<string, JsonValue | undefined>()
  let duplicateCss = 0
  let emptyPatches = 0
  let jsonBytes = 0
  for (const command of commands) {
    const [method] = command
    if (typeof method !== 'string') {
      continue
    }
    const commandBytes = getJsonBytes(command)
    jsonBytes += commandBytes
    const current = methods.get(method) ?? { count: 0, jsonBytes: 0 }
    methods.set(method, {
      count: current.count + 1,
      jsonBytes: current.jsonBytes + commandBytes,
    })
    if (
      method === 'Viewlet.setPatches' &&
      isJsonArray(command[2]) &&
      command[2].length === 0
    ) {
      emptyPatches++
    }
    if (
      (method === 'Viewlet.setCss' || method === 'Css.addCssStyleSheet') &&
      typeof command[2] === 'string'
    ) {
      const key = getStyleSheetKey(command[1])
      if (styleSheets.get(key) === command[2]) {
        duplicateCss++
      }
      styleSheets.set(key, command[2])
    }
  }
  return {
    count: commands.length,
    duplicateCss,
    emptyPatches,
    jsonBytes,
    methods: Array.from(methods, ([method, summary]) => ({
      method,
      ...summary,
    })).toSorted((left, right) => left.method.localeCompare(right.method)),
    renderBatches: getRenderBatchSummary(messages, timings),
  }
}

const serializeReceivedMessagesExpression = `(() => {
  const messages = globalThis.____receivedMessages;
  if (!Array.isArray(messages)) {
    throw new Error('Renderer message capture was not installed');
  }
  const normalize = (value, seen) => {
    if (value === null || typeof value === 'string' || typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : null;
    }
    if (typeof value === 'bigint') {
      return String(value);
    }
    if (typeof value !== 'object') {
      return undefined;
    }
    if (seen.has(value)) {
      return undefined;
    }
    seen.add(value);
    if (Array.isArray(value)) {
      const result = [];
      for (const item of value) {
        const normalized = normalize(item, seen);
        if (normalized !== undefined) {
          result.push(normalized);
        }
      }
      return result;
    }
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) {
      return undefined;
    }
    const result = {};
    for (const [key, item] of Object.entries(value)) {
      const normalized = normalize(item, seen);
      if (normalized !== undefined) {
        result[key] = normalized;
      }
    }
    return result;
  };
  return JSON.stringify(messages.map(message => normalize(message, new WeakSet())));
})()`

const serializeReceivedMessageTimingsExpression =
  'JSON.stringify(globalThis.____receivedMessageTimings)'

const getCapturedRendererValues = async <T>(
  page: Page,
  expression: string,
  label: string,
): Promise<readonly T[]> => {
  const session = await page.context().newCDPSession(page)
  try {
    const response = await session.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
    })
    if (response.exceptionDetails) {
      throw new Error(
        response.exceptionDetails.exception?.description ||
          response.exceptionDetails.text,
      )
    }
    const { value } = response.result
    if (typeof value !== 'string') {
      throw new TypeError(`Expected serialized ${label}`)
    }
    const values = JSON.parse(value) as unknown
    if (!Array.isArray(values)) {
      throw new TypeError(`Expected ${label} to be an array`)
    }
    return values as readonly T[]
  } finally {
    await session.detach()
  }
}

export const getReceivedRendererMessages = async (
  page: Page,
): Promise<readonly JsonValue[]> => {
  return getCapturedRendererValues<JsonValue>(
    page,
    serializeReceivedMessagesExpression,
    'renderer messages',
  )
}

export const getReceivedRendererMessageTimings = async (
  page: Page,
): Promise<readonly RendererMessageTiming[]> => {
  return getCapturedRendererValues<RendererMessageTiming>(
    page,
    serializeReceivedMessageTimingsExpression,
    'renderer message timings',
  )
}
