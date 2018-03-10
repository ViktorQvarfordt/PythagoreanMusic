/* eslint-env browser */


class Pythagoras {
  constructor() {
    this.audioCtx = new AudioContext()
    this.masterGain = this.audioCtx.createGain()
    this.masterGain.connect(this.audioCtx.destination)
  }

  play(ratioss) {
    // Set up oscillators
    const numOscs = Math.max(...ratioss.map(ratios => ratios.length))
    ratioss.push(Array(numOscs).fill(0)) // End with silence
    const oscs = []
    for (let i = 0; i < numOscs; i++) {
      const osc = this.audioCtx.createOscillator()
      osc.connect(this.masterGain)
      osc.frequency.setValueAtTime(0, 0)
      osc.start()
      oscs.push(osc)
    }

    const baseFreq = 300
    const toneLength = 0.5 // seconds
    const t0 = this.audioCtx.currentTime

    for (let t = 0; t < ratioss.length; t++) {
      const ratios = ratioss[t]

      for (let i = 0; i < numOscs; i++) {
        const osc = oscs[i]

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
    console.log(ratioss)
    pythagoras.play(ratioss)
  }, 0)
})
