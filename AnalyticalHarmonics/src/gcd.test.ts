import { gcd } from '~/gcd'

describe('gcd', () => {
  it('1', () => {
    expect(gcd(12, 10)).toBe(2)
    expect(gcd(12, 15)).toBe(3)
    expect(gcd(12, 6)).toBe(6)

    expect(gcd([12, 10])).toBe(2)
    expect(gcd([12, 15])).toBe(3)
    expect(gcd([12, 6])).toBe(6)
    expect(gcd([12, 6, 15])).toBe(3)
    expect(gcd([3, 5])).toBe(1)

    expect(gcd([12, 10])).toBe(2)
    expect(gcd([12, 15])).toBe(3)
    expect(gcd([12, 6])).toBe(6)
    expect(gcd([12, 6, 15])).toBe(3)
    expect(gcd([3, 5])).toBe(1)
  })
})
