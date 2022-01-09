import React, { useRef, useState } from 'react'
import { Chord, getChords } from '~/lib/chord'
import { Ratio } from '~/lib/ratio'
import { ChordSpec, Synth, ToneSpec } from '~/lib/synth'
import { enumerate } from '~/lib/utils'
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

const NoSsr: React.FC = ({ children }) => <>{process.browser ? children : <span />}</>

const View = () => {
  const synthRef = useRef<Synth>()
  window.synthRef = synthRef
  // const [text, setText] = useState('300 450 400 350 300 300 300')
  const [text, setText] = useState(
    '1/1 3/2 2/3 4/3 3/4 5/4 4/5 3/2 2/3 4/3 3/4 5/4 4/5 3/2 2/3 4/3 3/4 5/4 4/5'
  )

  const toneLength = 0.5
  const startFrequency = 300

  const transformAbs = (): ToneSpec[] =>
    text.split(' ').map((val, i) => ({
      frequency: parseInt(val),
      velocity: 0.5,
      start: i * toneLength,
      duration: toneLength * 0.9,
    }))

  const transformAbsChord = (): ChordSpec[] =>
    text.split(' ').map((val, i) => ({
      frequencies: [parseInt(val), parseInt(val) * (3 / 2)],
      velocity: 0.5,
      start: i * toneLength,
      duration: toneLength * 0.9,
    }))

  const transformRel = (): ToneSpec[] => {
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

  return (
    <>
      <button onClick={() => (synthRef.current = new Synth())}>Init</button>
      <br />

      <textarea value={text} onChange={e => setText(e.target.value)}></textarea>
      <button onClick={() => synthRef.current?.play(transformAbs())}>Play abs</button>
      <button onClick={() => synthRef.current?.playChord(transformAbsChord())}>Play chord</button>

      <br />

      <textarea value={text} onChange={e => setText(e.target.value)}></textarea>
      <button onClick={() => synthRef.current?.play(transformRel())}>Play rel</button>

      <br />

      <button onClick={() => synthRef.current?.stop()}>stop</button>
      <button onClick={() => synthRef.current?.destroy()}>destroy</button>

      <pre>
        {tabular(getChords(2, 2).map(Chord.analyze))}
        <br />
        <br />
        {tabular(getChords(3, 3.1).map(Chord.analyze))}
      </pre>
    </>
  )
}

export default function Page() {
  return (
    <div suppressHydrationWarning={true}>
      <NoSsr>
        <View />
      </NoSsr>
    </div>
  )
}
