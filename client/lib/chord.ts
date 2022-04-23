import { CartesianProduct, Combination } from 'js-combinatorics'
import _ from 'lodash'
import util from 'util'
import { gcd } from '~/lib/gcd'
import { R, Ratio } from '~/lib/ratio'
import { asNonNullable, assert, semitoneToNote, toPercentRelZero, toSemitoneData } from '~/lib/utils'

export class Chord {
  private readonly xs: number[]

  static fromString = (s: string) => new Chord(s.split(':').map(x => parseInt(x)))

  static toString = (c: Chord) => c.toString()

  static eq = (c1: Chord, c2: Chord) => c1.eq(c2)

  static impurity = (c: Chord) => c.impurity()

  static diag = (c: Chord) => c.diag()

  static analyze = (c: Chord) => c.analyze()

  static valid = (xs: number[]): boolean => {
    const d = gcd(xs)
    return (
      xs.map(x => x / d).every(x => Number.isSafeInteger(x) && x > 0) &&
      xs.length === _.uniq(xs).length &&
      xs.length > 0
    )
  }

  constructor(xs: number[]) {
    this.xs = xs
    const d = gcd(this.xs)
    this.xs = this.xs.map(x => x / d)
    this.xs.sort((x1, x2) => x1 - x2)
    this.assert()
  }

  toString = () => this.xs.join(':');

  [util.inspect.custom] = () => this.toString()

  toJSON = () => this.toString()

  eq = (that: Chord) => _.zip(this.xs, that.xs).every(([x1, x2]) => x1 === x2)

  impurity = () => _.sum(this.xs)

  length = () => this.xs.length

  diag = () => asNonNullable(_.last(this.xs)) / asNonNullable(_.first(this.xs))

  toRatios = (): Ratio[] => {
    const d = asNonNullable(this.xs[0])
    return this.xs.slice(1).map(x => new Ratio(x, d))
  }

  analyze = (): string[] => {
    const rs = this.toRatios()
    const tones = ['C', ...rs.map(r => semitoneToNote(toSemitoneData(r).semitone))]
    const semitoneError = rs.map(r => toPercentRelZero(toSemitoneData(r).semitoneError)).join(' ')
    const data = [
      this.toString(),
      this.impurity().toString(),
      this.diag().toFixed(2),
      rs.join(' '),
      tones.join(' '),
      semitoneError,
    ]
    return data
  }

  private assert(): void {
    this.xs.forEach(x => {
      assert(Number.isSafeInteger(x), `Chord can only contain integer, got ${x}`)
      assert(x >= 1, `Chord cannot contain values < 1, got ${x}`)
    })
    assert(this.xs.length === _.uniq(this.xs).length, 'Chord cannot contain duplicates')
    assert(this.xs.length > 0, 'Chord must contain at least one period')
  }
}

export const C = Chord.fromString

export const getChords = ({
  a,
  b,
  n,
  maxDiag,
  exactDiag,
}: {
  a: number
  b: number
  n: number
} & (
  | {
      maxDiag: number
      exactDiag?: number
    }
  | {
      maxDiag?: number
      exactDiag: number
    }
)): Chord[] => {
  const result: Chord[] = []
  let counter = 0
  console.log('getChords()')
  for (const comb of new Combination(_.range(a, b), n)) {
    counter++
    if (counter % 10 === 0) console.log(counter)
    if (!Chord.valid(comb)) continue
    const chord = new Chord(comb)
    const chordDiag = chord.diag()
    if (maxDiag !== undefined && chordDiag > maxDiag) continue
    if (exactDiag !== undefined && chordDiag !== exactDiag) continue
    result.push(chord)
  }
  return result
}
;(() => {
  let ratios: Ratio[] = []
  for (const [a, b] of new CartesianProduct(_.range(2, 30), _.range(2, 30))) {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    ratios.push(new Ratio(a, b))
  }
  ratios = _.uniqWith(ratios, Ratio.eq)
  ratios = _.sortBy(ratios, r => r.toFloat())
  for (const r of ratios) {
    console.log(`${r.a}/${r.b} = ${r.toFloat()}`)
  }

  console.log(new Chord([8 * 3, 9 * 3, 5 * 2 * 3, 4 * 8, 3 * 3 * 4, 5 * 8, 15 * 3]).toString())

  const rss = [
    [R('1/1'), R('9/8'), R('5/4'), R('4/3'), R('3/2'), R('5/3'), R('15/8'), R('2/1')],
    [R('1/1'), R('9/8'), R('5/4'), R('4/3'), R('3/2'), R('5/3'), R('17/9')],
    [R('1/1'), R('9/8'), R('5/4'), R('4/3'), R('3/2'), R('5/3'), R('19/10')],
    [R('1/1'), R('3/2'), R('4/3'), R('5/4'), R('6/5'), R('7/6'), R('2/1')],
    [R('7/7'), R('8/7'), R('9/7'), R('10/7'), R('11/7'), R('12/7'), R('13/7'), R('2/1')],
  ]

  for (const rs of rss) {
    const d = rs.map(r => r.b).reduce((a, b) => a * b)
    const ints = rs.map(r => r.mult(new Ratio(d, 1))).map(r => r.toFloat())
    const chord = new Chord(ints)
    console.log(chord.toString())
  }

  for (const [a, b] of new Combination(
    '24:27:30:32:36:40:45:48'.split(':').map(x => parseInt(x)),
    2
  )) {
    console.log(new Ratio(a, b).toString())
  }

  for (const [a, b] of new Combination(
    '7:8:9:10:11:12:13:14'.split(':').map(x => parseInt(x)),
    2
  )) {
    console.log(new Ratio(a, b).toString())
  }
})()

/*
 
 0  1/1
 2  9/8 1,1224620483
 4  5/4 1,2599210499
 5  4/3 1,3348398542
 7  3/2 1,4983070769
 9  5/3 1,6817928305
11 15/8 1,8877486254

15/8 = 1.875
17/9 = 1.8888888888888888
19/10 = 1.9


[8*3, 9*3, 5*2*3, 4*8, 3*3*4, 5*8, 15*3] 24:27:30:32:36:40:45


24:27:30:32:36:40:45:48


*/
