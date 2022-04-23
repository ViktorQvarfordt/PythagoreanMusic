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

export type TriggerSpec = {
  id: number
  frequency: number
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
    this.gn.gain.value = 0
    this.gn.connect(an)

    this.on = an.context.createOscillator()
    this.on.type = 'sawtooth'
    this.on.frequency.setValueAtTime(0, 0)
    this.on.start()
    this.on.connect(this.gn)

    // Custom waveform
    const n = 5
    const real = new Float32Array(n)
    const imag = new Float32Array(n)
    // const freqs = [1, 0.442, 0.315, 0.083] // piano
    // const freqs = [1, 1.869, 0.042, 0.022] // clarinet
    // const freqs = [0, 1]
    _.range(1, n).map(i => {
      real[i] = 1 / Math.pow(2, i)
      // real[i] = freqs[i] ?? 0
      // if (i % 2 === 1) {
      //   // real[i] = 1 / Math.pow(i, 2)
      //   real[i] = 1 / (2 * i - 1)
      //   // imag[i] = 1 / Math.pow(i, 3)
      // }
    })
    // imag[1] = 1
    // console.log(real)
    this.on.setPeriodicWave(this.on.context.createPeriodicWave(real, imag))
    this.on.type = 'sawtooth'
  }

  trigger = (spec: TriggerSpec): void => {
    const t0 = this.on.context.currentTime

    this.on.frequency.value = spec.frequency

    this.gn.gain.cancelAndHoldAtTime(t0)
    this.gn.gain.setTargetAtTime(1, t0, 0.025)
  }

  release = (): void => {
    const t0 = this.on.context.currentTime

    this.gn.gain.cancelAndHoldAtTime(t0)
    this.gn.gain.setTargetAtTime(0, t0, 0.05)
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
  tnm: Map<number, ToneNode>
  cn: ChordNode

  constructor() {
    console.debug('Synth.constructor()')
    this.ac = new window.AudioContext()
    this.masterGain = this.ac.createGain()
    this.masterGain.gain.value = 0.25
    this.masterGain.connect(this.ac.destination)
    this.tnm = new Map(_.range(36).map(i => [i, new ToneNode(this.masterGain)]))
    this.cn = new ChordNode(this.masterGain)
  }

  trigger = (spec: TriggerSpec) => {
    console.debug('trigger()', spec)
    this.tnm.get(spec.id)?.trigger(spec)
  }

  release = (spec: Pick<TriggerSpec, 'id'>) => {
    console.log('release')
    this.tnm.get(spec.id)?.release()
  }

  play = (tones: ToneSpec[]) => {
    throw new Error('not implemented')
    // console.debug('play()', tones)
    // for (const tone of tones) {
    //   this.tn.play(tone)
    // }
  }

  playChord = (chords: ChordSpec[]) => {
    console.debug('playChord()', chords)
    for (const chord of chords) {
      this.cn.play(chord)
    }
  }

  stop = () => {
    // this.tn.stop()
  }

  destroy = async (): Promise<void> => {
    console.debug('destroy()')
    await this.ac.close()
    // this.tn.destroy()
  }
}
