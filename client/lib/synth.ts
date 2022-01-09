import _ from 'lodash'
import { asNonNullable, enumerate } from '~/lib/utils'

export type ChordSpec = {
  frequencies: number[]
  velocity: number
  start: number
  duration: number
}

export type ToneSpec = {
  frequency: number
  velocity: number
  start: number
  duration: number
}

/// Custom waveform
// const real = new Float32Array(100)
// const imag = new Float32Array(100)
// // const freqs = [1, 0.442, 0.315, 0.083] // piano
// const freqs = [1, 1.869, 0.042, 0.022] // clarinet
// // _.range(1, 100).forEach(i => {
// //   real[i] = freqs[i] ?? 0
// //   // if (i % 2 === 1) {
// //   //   // real[i] = 1 / Math.pow(i, 2)
// //   //   real[i] = 1 / (2 * i - 1)
// //   //   // imag[i] = 1 / Math.pow(i, 3)
// //   // }
// // })
// imag[1] = 1
// console.log(real)
// osc.setPeriodicWave(this.audioContext.createPeriodicWave(real, imag))

class ChordNode {
  private readonly ons: OscillatorNode[]
  private readonly gn: GainNode

  constructor(an: AudioNode) {
    this.gn = an.context.createGain()
    this.gn.connect(an)

    // 8 ch
    this.ons = _.range(8).map(() => {
      const on = an.context.createOscillator()
      on.type = 'sawtooth'
      on.frequency.setValueAtTime(0, 0)
      on.start()
      on.connect(this.gn)
      return on
    })
  }

  play = (chord: ChordSpec): void => {
    const maxAmp = 1
    const susAmp = 0.7
    const attack = 0.02
    const decay = 0.1
    const release = 0.2
    const timeBetweenTones = 0.1
    const sustain = Math.max(chord.duration - attack - decay - release - timeBetweenTones, 0)
    console.log({ toneStart: chord.start, sustain })

    const t0 = this.gn.context.currentTime + chord.start

    for (const [freq, i] of enumerate(chord.frequencies)) {
      const on = asNonNullable(this.ons[i])

      on.frequency.setValueAtTime(freq, t0)

      this.gn.gain.setValueAtTime(0, t0)

      this.gn.gain.linearRampToValueAtTime(maxAmp, t0 + attack)
      this.gn.gain.setValueAtTime(maxAmp, t0 + attack)

      this.gn.gain.linearRampToValueAtTime(susAmp, t0 + attack + decay)
      this.gn.gain.setValueAtTime(susAmp, t0 + attack + decay)
      this.gn.gain.setValueAtTime(susAmp, t0 + attack + decay + sustain)

      this.gn.gain.linearRampToValueAtTime(0, t0 + attack + decay + sustain + release)
      this.gn.gain.setValueAtTime(0, t0 + attack + decay + sustain + release)
    }
  }
}

class ToneNode {
  private readonly on: OscillatorNode
  private readonly gn: GainNode

  constructor(an: AudioNode) {
    this.gn = an.context.createGain()
    this.gn.connect(an)

    this.on = an.context.createOscillator()
    this.on.type = 'sawtooth'
    this.on.frequency.setValueAtTime(0, 0)
    this.on.start()
    this.on.connect(this.gn)
  }

  play = (tone: ToneSpec): void => {
    const maxAmp = 1
    const susAmp = 0.7
    const attack = 0.02
    const decay = 0.1
    const release = 0.2
    const timeBetweenTones = 0.1
    const sustain = Math.max(tone.duration - attack - decay - release - timeBetweenTones, 0)
    console.log({ toneStart: tone.start, sustain })

    const t0 = this.on.context.currentTime + tone.start

    this.on.frequency.setValueAtTime(tone.frequency, t0)

    this.gn.gain.setValueAtTime(0, t0)

    this.gn.gain.linearRampToValueAtTime(maxAmp, t0 + attack)
    this.gn.gain.setValueAtTime(maxAmp, t0 + attack)

    this.gn.gain.linearRampToValueAtTime(susAmp, t0 + attack + decay)
    this.gn.gain.setValueAtTime(susAmp, t0 + attack + decay)
    this.gn.gain.setValueAtTime(susAmp, t0 + attack + decay + sustain)

    this.gn.gain.linearRampToValueAtTime(0, t0 + attack + decay + sustain + release)
    this.gn.gain.setValueAtTime(0, t0 + attack + decay + sustain + release)
  }

  stop = (): void => this.on.stop()

  destroy = (): void => {
    this.stop()
    this.gn.disconnect()
    this.on.disconnect()
  }
}

export class Synth {
  ac: AudioContext
  masterGain: GainNode
  tn: ToneNode
  cn: ChordNode

  constructor() {
    console.debug('Synth.constructor()')
    this.ac = new window.AudioContext()
    this.masterGain = this.ac.createGain()
    this.masterGain.connect(this.ac.destination)
    this.tn = new ToneNode(this.masterGain)
    this.cn = new ChordNode(this.masterGain)
  }

  play = (tones: ToneSpec[]) => {
    console.debug('play()', tones)
    for (const tone of tones) {
      this.tn.play(tone)
    }
  }

  playChord = (chords: ChordSpec[]) => {
    console.debug('playChord()', chords)
    for (const chord of chords) {
      this.cn.play(chord)
    }
  }

  stop = () => this.tn.stop()

  destroy = async (): Promise<void> => {
    console.debug('destroy()')
    await this.ac.close()
    this.tn.destroy()
  }
}
