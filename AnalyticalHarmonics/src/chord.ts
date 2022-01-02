import _ from 'lodash'
import util from 'util'
import { gcd } from '~/gcd'
import { Ratio } from '~/ratio'
import { asNonNullable, assert, semitoneToNote, toPercentRelZero, toSemitoneData } from '~/utils'

export class Chord {
  private readonly xs: number[]

  static fromString = (s: string): Chord => new Chord(s.split(':').map(x => parseInt(x)))

  static toString = (c: Chord): string => c.toString()

  static inspect = (c: Chord): string => c.toString()

  static eq = (c1: Chord, c2: Chord): boolean => c1.eq(c2)

  static impurity = (c: Chord): number => c.impurity()

  static diag = (c: Chord): number => c.diag()

  static analyze = (c: Chord): string => c.analyze()

  static valid = (xs: number[]): boolean => {
    const d = gcd(xs)
    return (
      xs.map(x => x / d).every(x => Number.isSafeInteger(x) && x > 1) &&
      xs.length === _.uniq(xs).length &&
      xs.length > 1
    )
  }

  constructor(xs: number[]) {
    this.xs = xs
    const d = gcd(this.xs)
    this.xs = this.xs.map(x => x / d)
    this.xs.sort((x1, x2) => x1 - x2)
    this.assert()
  }

  toString = (): string => this.xs.join(':');

  [util.inspect.custom] = (): string => this.toString()

  toJSON = (): string => this.toString()

  eq = (that: Chord): boolean => _.zip(this.xs, that.xs).every(([x1, x2]) => x1 === x2)

  impurity = (): number => _.sum(this.xs)

  length = (): number => this.xs.length

  diag = (): number => asNonNullable(_.last(this.xs)) / asNonNullable(_.first(this.xs))

  toRatios = (): Ratio[] => {
    const d = asNonNullable(this.xs[0])
    return this.xs.slice(1).map(x => new Ratio(x, d))
  }

  analyze = (): string => {
    const rs = this.toRatios()
    const tones = ['C', ...rs.map(r => semitoneToNote(toSemitoneData(r).semitone))]
    const semitoneError = rs.map(r => toPercentRelZero(toSemitoneData(r).semitoneError)).join(' ')
    const data = [
      this.toString(),
      this.impurity(),
      this.diag().toFixed(2),
      rs.join(' '),
      tones.join(' '),
      semitoneError,
    ]
    return data.join('  ')
  }

  private assert(): void {
    this.xs.forEach(x => {
      assert(Number.isSafeInteger(x), `Chord can only contain integer, got ${x}`)
      assert(x > 1, `Chord cannot contain values <= 1, got ${x}`)
    })
    assert(this.xs.length === _.uniq(this.xs).length, 'Chord cannot contain duplicates')
    assert(this.xs.length > 1)
  }
}

export const C = Chord.fromString
