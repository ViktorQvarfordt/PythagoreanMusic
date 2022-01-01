import { semitones, toSemitone } from '~/utils'

describe('toSemitone', () => {
  it('invariant', () => {
    for (const { semitone, freq } of semitones) {
      expect(toSemitone(freq)).toEqual(semitone)
    }
  })
})
