import type { Page } from '@playwright/test'

export interface Tree {
  readonly children?: readonly (Tree | string)[]
  readonly props?: Readonly<Record<string, string | number | boolean>>
  readonly tag: string
}

export interface Sequence {
  readonly read: {
    readonly selector: string
    readonly properties?: readonly string[]
    readonly attributes?: readonly string[]
    readonly childNodes?: boolean
    readonly focus?: boolean
  }
  readonly setup?: {
    readonly properties?: Readonly<Record<string, string | number | boolean>>
    readonly focus?: boolean
    readonly selection?: readonly [number, number, string]
  }
  readonly trees: readonly Tree[]
}

export const element = (
  tag: string,
  children: readonly (Tree | string)[] = [],
  props: Tree['props'] = {},
): Tree => ({ tag, children, props })

export const runSequence = async (
  page: Page,
  sequence: Sequence,
): Promise<unknown> => {
  // The synchronous module fixture is evaluated before navigation's load event.
  await page.goto('/diff/edge-case-sequences.html')

  return page.evaluate((scenario) => {
    // @ts-ignore
    return globalThis.runEdgeCaseSequence(scenario)
  }, sequence)
}
