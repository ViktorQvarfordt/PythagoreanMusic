import { Set } from 'immutable'
import { CartesianProduct } from 'js-combinatorics'
import _ from 'lodash'
import util from 'util'
import { Ratio } from '~/ratio'

/**
 * Throws is condition is false. Narrows TS type if condition is true.
 *
 * Example:
 * ```ts
 * const x: number | undefined;
 * assert(x !== undefined)
 * x // TS infers x not undefined here
 * ```
 */
export function assert(condition: boolean, msg?: string): asserts condition {
  if (!condition) {
    throw new Error(msg ?? 'AssertionError')
  }
}

export function asNonNullable<T>(val: T | null | undefined, msg?: string): T {
  assert(val !== undefined && val !== null, msg)
  return val
}

export const cartProd = <T1, T2>(a1: T1[], a2: T2[]): [T1, T2][] => {
  const result: [T1, T2][] = []
  for (const v1 of a1) {
    for (const v2 of a2) {
      result.push([v1, v2])
    }
  }
  return result
}

export const multiCartProdWithoutDiagonals = <T>(arr: T[], n: number): T[][] => {
  return _.chain([...new CartesianProduct(..._.range(n).map(() => arr))])
    .map(comb => Set(comb))
    .filter(combSet => combSet.size === n)
    .map(combSet => [...combSet])
    .value()
}

export const semitones: { semitone: number; freq: number }[] = [
  { semitone: 0, freq: 2 ** (0 / 12) },
  { semitone: 1, freq: 2 ** (1 / 12) },
  { semitone: 2, freq: 2 ** (2 / 12) },
  { semitone: 3, freq: 2 ** (3 / 12) },
  { semitone: 4, freq: 2 ** (4 / 12) },
  { semitone: 5, freq: 2 ** (5 / 12) },
  { semitone: 6, freq: 2 ** (6 / 12) },
  { semitone: 7, freq: 2 ** (7 / 12) },
  { semitone: 8, freq: 2 ** (8 / 12) },
  { semitone: 9, freq: 2 ** (9 / 12) },
  { semitone: 10, freq: 2 ** (10 / 12) },
  { semitone: 11, freq: 2 ** (11 / 12) },
]

export function toSemitone(val: number): number
export function toSemitone(val: Ratio): number
export function toSemitone(val: number | Ratio): number {
  return _.chain(semitones)
    .map(({ semitone, freq }) => ({
      semitone,
      logDist: Math.log(val instanceof Ratio ? val.toFloat() : val) - Math.log(freq),
    }))
    .sortBy(({ logDist }) => Math.abs(logDist))
    .first()
    .get('semitone')
    .value()
}

export const log = (...args: unknown[]): void => {
  const opts = { showHidden: false, depth: null, colors: true }
  let first = true
  args.forEach(arg => {
    if (!first) process.stdout.write(' ')
    typeof arg === 'string' ? process.stdout.write(arg) : process.stdout.write(util.inspect(arg, opts))
    first = false
  })
  process.stdout.write('\n')
}
