import { Chord, getChords } from '~/lib/chord'
import styles from '~/styles/Index.module.css'

const tabular = (rows: string[][]) => {
  return (
    <table className={styles.table}>
      {rows.map((row, i) => (
        <tr key={i}>
          {row.map((col, j) => (
            <td key={j}>{col}</td>
          ))}
        </tr>
      ))}
    </table>
  )
}

export default function Page() {
  return (
    <pre>
      {tabular(getChords(2, 2).map(Chord.analyze))}
      <br />
      <br />
      {tabular(getChords(3, 3.1).map(Chord.analyze))}
    </pre>
  )
}
