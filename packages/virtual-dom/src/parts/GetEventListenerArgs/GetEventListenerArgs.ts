import * as GetEventListenerArg from '../GetEventListenerArg/GetEventListenerArg.ts'

export const getEventListenerArgs = (
  params: readonly string[],
  event: any,
): readonly any[] => {
  const serialized: any[] = Array.from(params, (param) =>
    GetEventListenerArg.getEventListenerArg(param, event),
  )
  return serialized
}
