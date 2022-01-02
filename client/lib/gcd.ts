import { assert } from '~/lib/utils'

const gcdTwo = (a: number, b: number): number => {
  assert(Number.isSafeInteger(a) && Number.isSafeInteger(b), `gcd(${a}, ${b}`)
  const result = b === 0 ? a : gcdTwo(b, a % b)
  assert(Number.isSafeInteger(result), `gcd result ${result}`)
  return result
}

const gcdArr = (arr: number[]): number => arr.reduce((acc, x) => gcdTwo(acc, x))

export function gcd(numbers: number[]): number
export function gcd(a: number, b: number): number
export function gcd(v1: number | number[], v2?: number): number {
  if (typeof v1 === 'number' && typeof v2 === 'number') return gcdTwo(v1, v2)
  if (Array.isArray(v1) && v2 === undefined) return gcdArr(v1)
  throw new Error('IllegalArgumentException')
}
