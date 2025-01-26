import * as GetEventListenerArg from '../GetEventListenerArg/GetEventListenerArg.ts'

export const getEventListenerArgs = (
  params: readonly string[],
  event: any,
): readonly any[] => {
  const serialized: any[] = []
  for (const param of params) {
    serialized.push(GetEventListenerArg.getEventListenerArg(param, event))
  }
  return serialized
}
