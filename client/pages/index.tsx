import React, { useEffect, useRef, useState } from 'react'
import { Chord, getChords } from '~/lib/chord'
import { R, Ratio } from '~/lib/ratio'
import { ChordSpec, Synth, ToneSpec } from '~/lib/synth'
import { useKeys, validKeys } from '~/lib/use-keys'
import { enumerate, isNonNullable } from '~/lib/utils'
import styles from '~/styles/Index.module.css'

const tabular = (rows: string[][]) => {
  return (
    <table className={styles.table}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((col, j) => (
              <td key={j}>{col}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

const Analyzer = () => {
  return (
    <pre>
      {tabular(getChords({ a: 1, b: 9, n: 2, maxDiag: 2 }).map(Chord.analyze))}
      {/* <br />
      <br />
      {tabular(getChords({ a: 1, b: 9, n: 3, maxDiag: 2 }).map(Chord.analyze))}
      <br />
      <br />
      {tabular(getChords({ a: 1, b: 9, n: 4, maxDiag: 2 }).map(Chord.analyze))}
      <br />
      <br /> */}
      {/* {tabular(getChords({ a: 1, b: 25, n: 8, exactDiag: 2 }).map(Chord.analyze))} */}
    </pre>
  )
}

const toneLength = 0.5
const startFrequency = 300

const transformAbs = (text: string): ToneSpec[] =>
  text.split(' ').map((val, i) => ({
    frequency: parseInt(val),
    velocity: 0.5,
    start: i * toneLength,
    duration: toneLength * 0.9,
  }))

const transformAbsChord = (text: string): ChordSpec[] =>
  text.split(' ').map((val, i) => ({
    frequencies: [parseInt(val), parseInt(val) * (3 / 2)],
    velocity: 0.5,
    start: i * toneLength,
    duration: toneLength * 0.9,
  }))

const transformRel = (text: string): ToneSpec[] => {
  let prevFreq = startFrequency
  const result: ToneSpec[] = []
  for (const [val, i] of enumerate(text.split(' '))) {
    console.log(val, i)
    const tone = {
      frequency: prevFreq * Ratio.fromString(val).toFloat(),
      velocity: 0.5,
      start: i * toneLength,
      duration: toneLength * 0.9,
    }
    prevFreq = tone.frequency
    result.push(tone)
  }
  console.log('transformRel()', result)
  return result
}

const keyToId: Record<string, number> = validKeys.reduce((acc, key, i) => ({ ...acc, [key]: i }), {})

const keyToRatio: Record<string, Ratio> = {
  // 4:5:6:7:8

  'y': R('1/1'),
  'u': R('7/6'),
  'i': R('4/3'),
  'o': R('3/2'),
  'p': R('5/3'),
  '[': R('2/1'),

  'h': R('1/1'),
  'j': R('5/4'),
  'k': R('3/2'),
  'l': R('7/4'),
  ';': R('2/1'),
  "'": R('2/1'),

  // 'h': R('1/1'),
  // 'j': R('6/5'),
  // 'k': R('7/5'),
  // 'l': R('8/5'),
  // ';': R('9/5'),
  // "'": R('2/1'),

  'b': R('1/1'),
  'n': R('8/7'),
  'm': R('9/7'),
  ',': R('10/7'),
  '.': R('11/7'),
  '/': R('2/1'),

  // 'b': R('1/1'),
  // 'y': R('2/1'),
  // 'u': R('3/1'),

  // 'h': R('3/2'),
  // 'j': R('4/3'),
  // 'k': R('5/4'),
  // 'l': R('6/5'),
  // ';': R('7/6'),

  // 'n': R('5/3'),
  // 'm': R('7/4'),
  // ',': R('7/5'),
  // '.': R('8/5'),
  // '/': R('9/5'),

  // 'i': R('8/7'),
  // 'o': R('9/7'),
  // 'p': R('9/8'),
}

const baseFreq = 440 * Math.pow(2, -9 / 12)

const LiveAnalyzer = () => {
  const keys = useKeys()

  const sustaiKeys = Object.entries(keys)
    .filter(([, state]) => state === 'sustain')
    .map(([key]) => key)
  const ratios = sustaiKeys.map(key => keyToRatio[key]).filter(isNonNullable)

  if (ratios.length === 0) return <></>

  if (ratios.length === 1) return <>{ratios[0]?.toString()}</>

  const d = ratios.map(r => r.b).reduce((a, b) => a * b)
  const ints = ratios.map(r => r.mult(new Ratio(d, 1))).map(r => r.toFloat())
  const chord = new Chord(ints)

  return <>{chord.toString()}</>
}

const View = () => {
  const synthRef = useRef<Synth>()
  // @ts-ignore
  window.synthRef = synthRef
  // const [text, setText] = useState('300 450 400 350 300 300 300')
  const [text, setText] = useState(
    '1/1 3/2 2/3 4/3 3/4 5/4 4/5 3/2 2/3 4/3 3/4 5/4 4/5 3/2 2/3 4/3 3/4 5/4 4/5'
  )

  const keys = useKeys()

  useEffect(() => {
    for (const [key, state] of Object.entries(keys)) {
      if (state === 'trigger') {
        const ratio = keyToRatio[key]
        const id = keyToId[key]
        if (ratio === undefined || id === undefined) continue
        synthRef.current?.trigger({
          frequency: baseFreq * ratio.toFloat(),
          id,
        })
      }

      if (state === 'release') {
        const id = keyToId[key]
        if (id === undefined) continue
        synthRef.current?.release({ id })
      }
    }
  }, [keys])

  return (
    <>
      <button onClick={() => (synthRef.current = new Synth())}>Init</button>
      <br />
      <textarea value={text} onChange={e => setText(e.target.value)}></textarea>
      <button onClick={() => synthRef.current?.play(transformAbs(text))}>Play abs</button>
      <button onClick={() => synthRef.current?.playChord(transformAbsChord(text))}>Play chord</button>
      <br />
      <textarea value={text} onChange={e => setText(e.target.value)}></textarea>
      <button onClick={() => synthRef.current?.play(transformRel(text))}>Play rel</button>
      <br />
      <button onClick={() => synthRef.current?.stop()}>stop</button>
      <button onClick={() => synthRef.current?.destroy()}>destroy</button>
    </>
  )
}

const NoSsr: React.FC = ({ children }) => <>{process.browser ? children : <span />}</>

export default function Page() {
  return (
    <div suppressHydrationWarning={true}>
      <NoSsr>
        <View />
        <LiveAnalyzer />
        <Analyzer />
      </NoSsr>
    </div>
  )
}
