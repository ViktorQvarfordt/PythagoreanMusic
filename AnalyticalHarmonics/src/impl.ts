import { Combination } from 'js-combinatorics'
import _ from 'lodash'
import { R, Ratio } from '~/ratio'
import {
  asNonNullable,
  cartProd,
  log,
  multiCartProdWithoutDiagonals,
  toSemitone as toSemitoneDelta,
} from '~/utils'

// const uniq = <T>(arr: T[]): T[] => {
//   const result: T[] = []
//   for (const el of arr) {
//     if (typeof el === 'string' && !result.includes(el)) {
//       result.push(el)
//     } else if (Array.isArray(el)) {
//       let exists = false
//       for (const r of result) {
//         if (r[0] === el[0] && r[1] === el[1]) {
//           exists = true
//         }
//       }
//       if (!exists) {
//         result.push(el)
//       }
//     }
//   }
//   return result
// }

const rs = _.chain(_.range(1, 20))
  .thru(it => cartProd(it, it))
  .map(([a, b]) => new Ratio(a, b))
  .filter(r => r.toFloat() > 1)
  .filter(r => r.toFloat() <= 2)
  .filter(r => r.purity() >= 0.05)
  .uniqWith(Ratio.eq)
  .value()

console.log(rs.join('\n'))

console.log()

const octavePairs = _.chain(rs)
  .map(r => [r, new Ratio(2, 1).div(r)] as const)
  .filter(([, r2]) => r2.toFloat() >= 1)
  .filter(([, r2]) => r2.a !== 1)
  .filter(([, r2]) => r2.b !== 1)
  .filter(rs => _.meanBy(rs, r => r.purity()) >= 0.05)
  .map(([r1, r2]) => (r1.toFloat() < r2.toFloat() ? [r1, r2] : ([r2, r1] as const)))
  .uniqWith(([r11, r12], [r21, r22]) => r11.eq(r21) && r12.eq(r22))
  .orderBy(rs => _.meanBy(rs, r => r.purity()), 'desc')
  .value()

const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

type Note = typeof notes[number]

const semitoneToNote = (semitone: number): Note => asNonNullable(notes[semitone])
const toPercent = (x: number): string => x.toFixed(2).slice(1)

log('pairs')
for (const pair of octavePairs) {
  console.log(
    pair.map(r => r.toString()).join(' '),
    pair.reduce((acc, r) => acc.mult(r), R('1/1')),
    '-',
    pair.map(r => semitoneToNote(toSemitoneDelta(r))).join(' '),
    '-',
    toPercent(_.meanBy(pair, r => r.purity()))
  )
}
log()

// Generalized paris
log({ rs })
const rss = _.chain(multiCartProdWithoutDiagonals(rs, 2))
  .filter(rs => _.meanBy(rs, r => r.purity()) >= 0.05)
  .map(it => _.sortBy(it, r => r.toFloat()))
  .uniqWith((rs1, rs2) => _.zip(rs1, rs2).every(([r1, r2]) => asNonNullable(r1).eq(asNonNullable(r2))))
  .orderBy(rs => _.meanBy(rs, r => r.purity()), 'desc')
  .value()

log('paris2')
log(rss.length)

for (const rs of rss) {
  log(
    rs.map(r => r.toString()).join(' '),
    '-',
    rs.map(r => semitoneToNote(toSemitoneDelta(r))).join(' '),
    '-',
    toPercent(_.meanBy(rs, r => r.purity()))
  )
}

type ChordAnalysis = {
  ratios: Ratio[]
  semitones: number[]
  n: Record<
    number,
    {
      combProducts: Ratio[]
      combPurityMeans: string[]
      combs: Ratio[][]
    }
  >
}

const analyzeChord = (ratios: Array<Ratio>): ChordAnalysis => ({
  ratios: ratios,
  semitones: ratios.map(toSemitoneDelta),
  n: _.chain(_.range(1, ratios.length + 1))
    .map(i => {
      const combs = Array.from(new Combination(ratios, i))
      const combProducts = combs.map(comb => comb.reduce((acc, r) => acc.mult(r), new Ratio(1, 1)))
      const combPurityMeans = combs.map(comb => toPercent(_.meanBy(comb, r => r.purity())))
      const combProductPurityMean = toPercent(_.meanBy(combProducts, r => r.purity()))
      const data = {
        combs,
        combPurityMeans,
        combProducts,
        combProductPurityMean,
      }

      return [i, data]
    })
    .fromPairs()
    .value(),
})

log()

for (const rs of [[R('7/4'), R('9/5')]]) {
  log(analyzeChord(rs))
  log()
}
