import { C, Chord } from '~/chord'

describe('Chord', () => {
  it('invariant 1', () => {
    const r1 = new Chord([2, 3, 4, 5])
    const r2 = C(r1.toString())
    expect(r1.eq(r2)).toBe(true)
  })

  it('invariant 2', () => {
    const s1 = '2:3:4:5'
    const s2 = C(s1).toString()
    expect(s1).toBe(s2)
  })

  it('normalization 1', () => {
    const s1 = '3:2:5:4'
    const s2 = C(s1).toString()
    expect(s2).toBe('2:3:4:5')
  })

  it('normalization 2', () => {
    const s1 = '6:15'
    const s2 = C(s1).toString()
    expect(s2).toBe('2:5')
  })

  it('normalization 2', () => {
    expect(C('2:4').toString()).toBe('1:2')
  })

  it('length', () => {
    expect(() => C('3:4:3')).toThrow()
  })

  it('misc', () => {
    expect(C('1').toString()).toBe('1')
    expect(C('3').toString()).toBe('1')
    expect(C('3').eq(C('1'))).toBe(true)
  })
})
