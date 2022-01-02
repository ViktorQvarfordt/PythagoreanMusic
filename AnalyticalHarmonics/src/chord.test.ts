import { Chord } from '~/chord'

describe('Chord', () => {
  it('invariant 1', () => {
    const r1 = new Chord([2, 3, 4, 5])
    const r2 = Chord.fromString(r1.toString())
    expect(r1.eq(r2)).toBe(true)
  })

  it('invariant 2', () => {
    const s1 = '2:3:4:5'
    const s2 = Chord.fromString(s1).toString()
    expect(s1).toBe(s2)
  })

  it('normalization 1', () => {
    const s1 = '3:2:5:4'
    const s2 = Chord.fromString(s1).toString()
    expect(s2).toBe('2:3:4:5')
  })

  it('normalization 2', () => {
    const s1 = '6:15'
    const s2 = Chord.fromString(s1).toString()
    expect(s2).toBe('2:5')
  })

  it('normalization 2', () => {
    expect(() => Chord.fromString('2:4')).toThrow()
  })

  it('length', () => {
    expect(() => Chord.fromString('3:4:3')).toThrow()
  })
})
