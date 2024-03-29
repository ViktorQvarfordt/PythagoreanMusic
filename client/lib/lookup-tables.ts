import { Ratio } from '~/lib/ratio'

const pianoFreq = {
  '1': 2 ** (0 / 12),
  '2': 2 ** (1 / 12),
  '3': 2 ** (2 / 12),
  '4': 2 ** (3 / 12),
  '5': 2 ** (4 / 12),
  '6': 2 ** (5 / 12),
  '7': 2 ** (6 / 12),
  '8': 2 ** (7 / 12),
  '9': 2 ** (8 / 12),
  '10': 2 ** (9 / 12),
  '11': 2 ** (10 / 12),
  '12': 2 ** (11 / 12),
}

const pianoFreqDecimal = {
  '1': 1,
  '2': 1.0594630943592953,
  '3': 1.122462048309373,
  '4': 1.189207115002721,
  '5': 1.2599210498948732,
  '6': 1.3348398541700344,
  '7': 1.4142135623730951,
  '8': 1.4983070768766815,
  '9': 1.5874010519681994,
  '10': 1.6817928305074292,
  '11': 1.7817974362806788,
  '12': 1.887748625363387,
}

// // Start on C#
// 0, 2,   5,   7,   9,   12
// 1, 9/8, 4/3, 3/2, 5/3, 2

// (4/3) / (9/8) == 32/27

// // 1.2% rel difference between 32/27 and 6/5

// // Start on D#
// 0, 3,   5,   7,   10,  12
// 1, 6/5, 4/5, 3/2, 9/5, 2

const pianoActualFreqZeroIndexed = {
  '0': 1, // C
  '1': 18 / 17, // C#
  '2': 9 / 8, // D
  '3': 6 / 5, // D#
  '4': 5 / 4, // E (major third)
  '5': 4 / 3, // F
  '6': 7 / 5, // F#
  '7': 3 / 2, // G (fifth)
  '8': 8 / 5, // G#
  '9': 5 / 3, // A
  '10': 9 / 5, // A#
  '11': 15 / 8, // B
  '12': 2, // C
}

const actualFreq2 = {
  '1': 1, // C
  '2': 18 / 17,
  '3': 9 / 8,
  '4': 6 / 5,
  '5': 5 / 4, // E (major third)
  '6': 4 / 3,
  '7': 7 / 5,
  '8': 3 / 2,
  '9': 8 / 5, // G#
  '10': 5 / 3,
  '11': 9 / 5,
  '12': 15 / 8,
  '13': 2, // C
}

console.log(new Ratio(3, 2))

// 3/2
// 4/3
// 5/3
// 5/4 (1)
// 6/5
// 7/4 *
// 7/5
// 7/6 * (1)
// 8/5
// 8/7 * (1)
// 9/5
// 9/7
// 9/8 (2 half tones)

// console.log(m)
