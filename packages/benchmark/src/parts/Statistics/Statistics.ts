export interface Statistics {
  readonly max: number
  readonly mean: number
  readonly median: number
  readonly min: number
  readonly p75: number
  readonly p95: number
  readonly standardDeviation: number
}

const round = (value: number): number => {
  return Math.round(value * 1000) / 1000
}

const percentile = (sorted: readonly number[], value: number): number => {
  const index = (sorted.length - 1) * value
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const lowerValue = sorted[lower] ?? 0
  const upperValue = sorted[upper] ?? lowerValue
  return lowerValue + (upperValue - lowerValue) * (index - lower)
}

export const getStatistics = (samples: readonly number[]): Statistics => {
  if (samples.length === 0) {
    throw new Error('At least one benchmark sample is required')
  }
  const sorted = samples.toSorted((a, b) => a - b)
  const mean =
    samples.reduce((total, sample) => total + sample, 0) / samples.length
  const variance =
    samples.reduce((total, sample) => total + (sample - mean) ** 2, 0) /
    samples.length

  return {
    max: round(sorted.at(-1) ?? 0),
    mean: round(mean),
    median: round(percentile(sorted, 0.5)),
    min: round(sorted[0] ?? 0),
    p75: round(percentile(sorted, 0.75)),
    p95: round(percentile(sorted, 0.95)),
    standardDeviation: round(Math.sqrt(variance)),
  }
}
