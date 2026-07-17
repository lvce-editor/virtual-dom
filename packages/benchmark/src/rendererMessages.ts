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

interface MethodSummary {
  readonly count: number
  readonly jsonBytes: number
  readonly method: string
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

export const getReceivedRendererMessages = async (
  page: Page,
): Promise<readonly JsonValue[]> => {
  const session = await page.context().newCDPSession(page)
  try {
    const response = await session.send('Runtime.evaluate', {
      expression: serializeReceivedMessagesExpression,
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
      throw new TypeError('Expected serialized renderer messages')
    }
    const messages = JSON.parse(value) as unknown
    if (!Array.isArray(messages)) {
      throw new TypeError('Expected renderer messages to be an array')
    }
    return messages as readonly JsonValue[]
  } finally {
    await session.detach()
  }
}
