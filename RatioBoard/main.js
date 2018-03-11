/* eslint-env browser */


const audioCtx = new AudioContext()
const masterGain = audioCtx.createGain()
masterGain.connect(audioCtx.destination)
masterGain.gain.setValueAtTime(0.5, 0)

const osc1 = audioCtx.createOscillator()
osc1.connect(masterGain)
osc1.frequency.setValueAtTime(300, 0)
osc1.start()

const osc2 = audioCtx.createOscillator()
osc2.connect(masterGain)
osc2.frequency.setValueAtTime(300, 0)
osc2.start()


function shiftFrequency(key) {
  let ratio1 = 1
  let ratio2 = 1

       if (key === 'a') ratio1 = '5/6'
  else if (key === 's') ratio1 = '4/5'
  else if (key === 'd') ratio1 = '3/4'
  else if (key === 'f') ratio1 = '2/3'
  else if (key === 'g') ratio1 = '1/2'
  else if (key === 'h') ratio1 = '2/1'
  else if (key === 'j') ratio1 = '3/2'
  else if (key === 'k') ratio1 = '4/3'
  else if (key === 'l') ratio1 = '5/4'
  else if (key === ';') ratio1 = '6/5'

       if (key === 'q') ratio2 = '5/6'
  else if (key === 'w') ratio2 = '4/5'
  else if (key === 'e') ratio2 = '3/4'
  else if (key === 'r') ratio2 = '2/3'
  else if (key === 't') ratio2 = '1/2'
  else if (key === 'y') ratio2 = '2/1'
  else if (key === 'u') ratio2 = '3/2'
  else if (key === 'i') ratio2 = '4/3'
  else if (key === 'o') ratio2 = '5/4'
  else if (key === 'p') ratio2 = '6/5'

  let freq1 = osc1.frequency.value * eval(ratio1)
  let freq2 = osc2.frequency.value * eval(ratio2)
  osc1.frequency.setValueAtTime(freq1, 0)
  osc2.frequency.setValueAtTime(freq2, 0)

  output.innerHTML = `
    You shifted frequency1 with ratio1: ${ratio1}<br>
    Current frequency1: ${freq1.toFixed(2)}<br><br>
    You shifted frequency2 with ratio2: ${ratio2}<br>
    Current frequency2: ${freq2.toFixed(2)}`
}

shiftFrequency()
document.addEventListener('keydown', (event) => shiftFrequency(event.key))
