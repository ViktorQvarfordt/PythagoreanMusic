import _ from 'lodash'
import util from 'util'
import { gcd } from '~/lib/gcd'
import { Ratio } from '~/lib/ratio'
import {
  asNonNullable,
  assert,
  multiCartProdWithoutDiagonals,
  semitoneToNote,
  toPercentRelZero,
  toSemitoneData,
} from '~/lib/utils'

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

export const getChords = (n: number, max: number = 3): Chord[] =>
  _.chain(_.range(2, 10))
    .thru(it => multiCartProdWithoutDiagonals(it, n))
    .filter(Chord.valid)
    .map(xs => new Chord(xs))
    .filter(c => c.diag() < max)
    .uniqWith(Chord.eq)
    .sortBy(Chord.impurity)
    .value()
