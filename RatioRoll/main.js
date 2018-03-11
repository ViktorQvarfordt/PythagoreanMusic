/* eslint-env browser */


class Pythagoras {
  constructor() {
    this.audioCtx = new AudioContext()
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.connect(this.audioCtx.destination)
    this.oscs = []
  }

  initOscillators() {
    // Clear old oscillators
    this.oscs.map(osc => {
      osc.stop()
      osc.disconnect()
    })

    // Set up oscillators, 10 should be enough
    const numOscs = 10
    this.oscs = []
    for (let i = 0; i < numOscs; i++) {
      const osc = this.audioCtx.createOscillator()
      osc.connect(this.masterGain)
      osc.frequency.setValueAtTime(0, 0)
      osc.start()
      this.oscs.push(osc)
    }
  }

  play(ratioss) {
    this.initOscillators()
    ratioss.push(Array(this.oscs.length).fill(0)) // End with silence

    const baseFreq = 300
    const toneLength = 0.5 // seconds
    const t0 = this.audioCtx.currentTime

    for (let t = 0; t < ratioss.length; t++) {
      const ratios = ratioss[t]

      for (let i = 0; i < this.oscs.length; i++) {
        const osc = this.oscs[i]

        // Only activate as many oscillators as there are specified ratios
        let ratio = 0
        if (i < ratios.length) {
          ratio = ratios[i]
        }
        const timeOffset = t0 + t * toneLength

        osc.frequency.setValueAtTime(baseFreq * ratio, timeOffset)
        this.masterGain.gain.setValueAtTime(1 / ratios.length, timeOffset) // Avoid clipping
      }

    }

  }
}


const pythagoras = new Pythagoras()

document.addEventListener('keydown', (event) => {
  if (!(event.key === 'Enter' && event.ctrlKey)) return
  // Delay execution until next event loop so that DOM has time to update
  setTimeout(() => {
    const ratioss = eval(document.getElementById('input').value)
    pythagoras.play(ratioss)
  }, 0)
})

play = (sound) => {
  setTimeout(() => {
    pythagoras.play(sound)
  }, 0)
}
