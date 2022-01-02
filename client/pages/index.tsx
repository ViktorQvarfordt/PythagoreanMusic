import React, { useState } from 'react'
import { Chord, getChords } from '~/lib/chord'
import { Synth } from '~/lib/synth'
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
  const [synth] = useState(() => new Synth())

  return (
    <>
      <button onClick={() => synth.play()}>Play</button>
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
