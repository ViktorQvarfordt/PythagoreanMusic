import { Ratio } from '~/ratio'

describe('Rational', () => {
  it('invariant 1', () => {
    const r1 = new Ratio(3, 2)
    const r2 = Ratio.fromString(r1.toString())
    expect(r1.eq(r2)).toBe(true)
  })

  it('invariant 2', () => {
    const s1 = '3/2'
    const s2 = Ratio.fromString(s1).toString()
    expect(s1).toBe(s2)
  })
})
