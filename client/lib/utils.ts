import { Set } from 'immutable'
import { CartesianProduct } from 'js-combinatorics'
import _ from 'lodash'
import util from 'util'
import { Ratio } from '~/lib/ratio'

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

export function isNonNullable<T>(val: T | null | undefined): val is T {
  return val !== undefined && val !== null
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

export const semitones: { semitone: number; freq: number }[] = _.range(50).map(i => ({
  semitone: i,
  freq: 2 ** (i / 12),
}))

type semitoneData = {
  semitone: number
  freq: number
  relativeError: number
  semitoneError: number
}

export function toSemitoneData(val: number): semitoneData
export function toSemitoneData(val: Ratio): semitoneData
export function toSemitoneData(val: number | Ratio): semitoneData {
  return _.chain(semitones)
    .map(({ semitone, freq }) => {
      const float = val instanceof Ratio ? val.toFloat() : val
      return {
        semitone,
        freq,
        relativeError: freq / float,
        semitoneError: Math.log(freq / float) / Math.log(Math.pow(2, 1 / 12)),
      }
    })
    .sortBy(({ semitoneError }) => Math.abs(semitoneError))
    .first()
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

export const notes = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
  'C2',
  'C2#',
  'D2',
  'D2#',
  'E2',
  'F2',
  'F2#',
  'G2',
  'G2#',
  'A2',
  'A2#',
  'B2',
] as const

export type Note = typeof notes[number]

export const semitoneToNote = (semitone: number): Note => asNonNullable(notes[semitone])

export const toPercentRelZero = (x: number): string => {
  assert(-1 < x && x < 1, `Expected -1 < x < 1 but got ${x}`)
  const sign = Math.sign(x)
  return `${sign < 0 ? '-' : '+'}${Math.abs(x).toFixed(2).slice(2)}%`
}

export function* enumerate<T>(iter: Iterable<T>): Iterable<[T, number]> {
  let i = 0
  for (const val of iter) {
    yield [val, i]
    i++
  }
}
