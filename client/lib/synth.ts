import { asNonNullable } from '~/lib/utils'

export class Synth {
  audioCtx: AudioContext
  masterGain: GainNode
  oscs: OscillatorNode[]

  constructor() {
    console.log('Synth.constructor')
    this.audioCtx = new window.AudioContext()
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.connect(this.audioCtx.destination)
    this.oscs = []
  }

  clearOscs = () => {
    this.oscs.forEach(osc => {
      osc.stop()
      osc.disconnect()
    })
    this.oscs = []
  }

  initOscs = (n: number) => {
    this.clearOscs()

    for (let i = 0; i < n; i++) {
      const osc = this.audioCtx.createOscillator()
      osc.connect(this.masterGain)
      osc.frequency.setValueAtTime(0, 0)
      osc.start()
      this.oscs.push(osc)
    }
  }

  play = () => {
    this.initOscs(3)
    const fss = [
      [300, 300, 300],
      [300, 300 * (4 / 3), 300 * (5 / 4)],
      [0, 0, 0], // End with silence
    ]

    const toneLength = 0.5 // seconds
    const t0 = this.audioCtx.currentTime

    for (let t = 0; t < fss.length; t++) {
      const fs = asNonNullable(fss[t])

      for (let i = 0; i < this.oscs.length; i++) {
        const osc = asNonNullable(this.oscs[i])

        const f = asNonNullable(fs[i])
        const timeOffset = t0 + t * toneLength

        osc.frequency.setValueAtTime(f, timeOffset)
        this.masterGain.gain.setValueAtTime(1 / fs.length, timeOffset) // Avoid clipping
      }
    }
  }
}
