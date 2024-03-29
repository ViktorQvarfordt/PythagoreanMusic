import util from 'util'
import { gcd } from '~/lib/gcd'
import { asNonNullable, assert } from '~/lib/utils'

export class Ratio {
  a: number
  b: number

  static fromString(s: string): Ratio {
    const [a, b] = s.split('/').map(x => parseInt(x))
    return new Ratio(asNonNullable(a), asNonNullable(b))
  }

  static toString = (r: Ratio): string => r.toString()

  static inspect = (r: Ratio): string => r.toString()

  static eq = (r1: Ratio, r2: Ratio): boolean => r1.eq(r2)

  constructor(a: number, b: number) {
    assert(Number.isSafeInteger(a) && Number.isSafeInteger(b))
    assert(a > 0)
    assert(b > 0)
    this.a = a
    this.b = b
    this.normalize()
  }

  toString = (): string => `${this.a}/${this.b}`;

  [util.inspect.custom] = (): string => this.toString()

  toJSON = (): string => this.toString()

  eq = (r: Ratio): boolean => this.a === r.a && this.b === r.b

  toFloat = (): number => this.a / this.b

  mult = (r: Ratio): Ratio => new Ratio(this.a * r.a, this.b * r.b)

  div = (r: Ratio): Ratio => new Ratio(this.a * r.b, this.b * r.a)

  purity = (k = 0.5): number => 1 / Math.pow(Math.pow(this.a, k) + Math.pow(this.b, k) - 1, 1 / k)

  private normalize(): void {
    const c = gcd(this.a, this.b)
    this.a = this.a / c
    this.b = this.b / c
    this.assert()
  }

  private assert(): void {
    if (!(Number.isSafeInteger(this.a) && Number.isSafeInteger(this.b))) {
      throw new Error(`assert failed for ${this.toString()}`)
    }
  }
}

export const R = Ratio.fromString
