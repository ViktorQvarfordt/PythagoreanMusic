import _ from 'lodash'
import { Chord } from '~/chord'
import { log, multiCartProdWithoutDiagonals } from '~/utils'

const getChords = (n: number, max: number = 3): Chord[] =>
  _.chain(_.range(2, 10))
    .thru(it => multiCartProdWithoutDiagonals(it, n))
    .filter(Chord.valid)
    .map(xs => new Chord(xs))
    .filter(c => c.diag() < max)
    .uniqWith(Chord.eq)
    .sortBy(Chord.impurity)
    .value()

log(getChords(2, 2).map(Chord.analyze).join('\n'))
log()
log(getChords(3, 3.1).map(Chord.analyze).join('\n'))
log()

// const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

// type Note = typeof notes[number]

// const semitoneToNote = (semitone: number): Note => asNonNullable(notes[semitone])
// const toPercent = (x: number): string => x.toFixed(2).slice(1)

// log('pairs')
// for (const pair of octavePairs) {
//   log(
//     pair.map(r => r.toString()).join(' '),
//     pair.reduce((acc, r) => acc.mult(r), R('1/1')),
//     '-',
//     pair.map(r => semitoneToNote(toSemitoneDelta(r))).join(' '),
//     '-',
//     toPercent(_.meanBy(pair, r => r.purity()))
//   )
// }
// log()

// // Generalized paris
// log({ rs })
// const rss = _.chain(multiCartProdWithoutDiagonals(rs, 2))
//   .filter(rs => _.meanBy(rs, r => r.purity()) >= 0.05)
//   .map(it => _.sortBy(it, r => r.toFloat()))
//   .uniqWith((rs1, rs2) => _.zip(rs1, rs2).every(([r1, r2]) => asNonNullable(r1).eq(asNonNullable(r2))))
//   .orderBy(rs => _.meanBy(rs, r => r.purity()), 'desc')
//   .value()

// log('paris2')
// log(rss.length)

// for (const rs of rss) {
//   log(
//     rs.map(r => r.toString()).join(' '),
//     '-',
//     rs.map(r => semitoneToNote(toSemitoneDelta(r))).join(' '),
//     '-',
//     toPercent(_.meanBy(rs, r => r.purity()))
//   )
// }

// type ChordAnalysis = {
//   ratios: Ratio[]
//   semitones: number[]
//   n: Record<
//     number,
//     {
//       combProducts: Ratio[]
//       combPurityMeans: string[]
//       combs: Ratio[][]
//     }
//   >
// }

// const analyzeChord = (ratios: Array<Ratio>): ChordAnalysis => ({
//   ratios: ratios,
//   semitones: ratios.map(toSemitoneDelta),
//   n: _.chain(_.range(1, ratios.length + 1))
//     .map(i => {
//       const combs = Array.from(new Combination(ratios, i))
//       const combProducts = combs.map(comb => comb.reduce((acc, r) => acc.mult(r), new Ratio(1, 1)))
//       const combPurityMeans = combs.map(comb => toPercent(_.meanBy(comb, r => r.purity())))
//       const combProductPurityMean = toPercent(_.meanBy(combProducts, r => r.purity()))
//       const data = {
//         combs,
//         combPurityMeans,
//         combProducts,
//         combProductPurityMean,
//       }

//       return [i, data]
//     })
//     .fromPairs()
//     .value(),
// })

// log()

// for (const rs of [
//   [R('1/1'), R('5/4'), R('3/2')],
//   [R('4/1'), R('5/1'), R('6/1')],
// ]) {
//   log(analyzeChord(rs))
//   log()
// }
