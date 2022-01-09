export type Tone = {
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

  play = (tone: Tone) => {
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

  destroy = () => {
    this.gn.disconnect()
    this.on.stop()
    this.on.disconnect()
  }
}

export class Synth {
  ac: AudioContext
  masterGain: GainNode
  tn: ToneNode

  constructor() {
    console.debug('Synth.constructor()')
    this.ac = new window.AudioContext()
    this.masterGain = this.ac.createGain()
    this.masterGain.connect(this.ac.destination)
    this.tn = new ToneNode(this.masterGain)
  }

  play = (tones: Tone[]) => {
    console.debug('play()', tones)
    for (const tone of tones) {
      this.tn.play(tone)
    }
  }

  destroy = async (): Promise<void> => {
    console.debug('destroy()')
    await this.ac.close()
    this.tn.destroy()
  }
}
