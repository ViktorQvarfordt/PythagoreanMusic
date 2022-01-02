import { Combination } from 'js-combinatorics'
import _ from 'lodash'
import { R, Ratio } from '~/lib/ratio'
import {
  asNonNullable,
  cartProd,
  log,
  multiCartProdWithoutDiagonals,
  semitoneToNote,
  toPercentRelZero,
  toSemitoneData,
} from '~/lib/utils'

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

log('pairs')
for (const pair of octavePairs) {
  console.log(
    pair.map(r => r.toString()).join(' '),
    pair.reduce((acc, r) => acc.mult(r), R('1/1')),
    '-',
    pair.map(r => semitoneToNote(toSemitoneData(r).semitone)).join(' '),
    '-',
    toPercentRelZero(_.meanBy(pair, r => r.purity()))
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
    rs.map(r => semitoneToNote(toSemitoneData(r).semitone)).join(' '),
    '-',
    toPercentRelZero(_.meanBy(rs, r => r.purity()))
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
  semitones: ratios.map(r => toSemitoneData(r).semitone),
  n: _.chain(_.range(1, ratios.length + 1))
    .map(i => {
      const combs = Array.from(new Combination(ratios, i))
      const combProducts = combs.map(comb => comb.reduce((acc, r) => acc.mult(r), new Ratio(1, 1)))
      const combPurityMeans = combs.map(comb => toPercentRelZero(_.meanBy(comb, r => r.purity())))
      const combProductPurityMean = toPercentRelZero(_.meanBy(combProducts, r => r.purity()))
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

for (const rs of [
  [R('1/1'), R('5/4'), R('3/2')],
  [R('4/1'), R('5/1'), R('6/1')],
]) {
  log(analyzeChord(rs))
  log()
}
