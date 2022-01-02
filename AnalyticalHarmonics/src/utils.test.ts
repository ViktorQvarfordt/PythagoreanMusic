import { semitones, toSemitoneData } from '~/utils'

describe('toSemitoneData', () => {
  it('invariant', () => {
    for (const { semitone, freq } of semitones) {
      expect(toSemitoneData(freq).semitone).toEqual(semitone)
      expect(toSemitoneData(freq).semitoneError).toEqual(0)
    }
  })
})
