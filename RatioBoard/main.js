/* eslint-env browser */


const audioCtx = new AudioContext()
const masterGain = audioCtx.createGain()
masterGain.connect(audioCtx.destination)
masterGain.gain.setValueAtTime(1/3, 0)

const osc1 = audioCtx.createOscillator()
osc1.connect(masterGain)
osc1.frequency.setValueAtTime(300, 0)
osc1.start()

const osc2 = audioCtx.createOscillator()
osc2.connect(masterGain)
osc2.frequency.setValueAtTime(300, 0)
osc2.start()

const osc3 = audioCtx.createOscillator()
osc3.connect(masterGain)
osc3.frequency.setValueAtTime(300, 0)
osc3.start()

let freq1 = 300
let freq2 = 300
let freq3 = 300


function shiftFrequency(key) {
  let ratio1 = 1
  let ratio2 = 1
  let ratio3 = 1

       if (key === 'q') ratio1 = '5/6'
  else if (key === 'w') ratio1 = '4/5'
  else if (key === 'e') ratio1 = '3/4'
  else if (key === 'r') ratio1 = '2/3'
  else if (key === 't') ratio1 = '1/2'
  else if (key === 'y') ratio1 = '2/1'
  else if (key === 'u') ratio1 = '3/2'
  else if (key === 'i') ratio1 = '4/3'
  else if (key === 'o') ratio1 = '5/4'
  else if (key === 'p') ratio1 = '6/5'

       if (key === 'a') ratio2 = '5/6'
  else if (key === 's') ratio2 = '4/5'
  else if (key === 'd') ratio2 = '3/4'
  else if (key === 'f') ratio2 = '2/3'
  else if (key === 'g') ratio2 = '1/2'
  else if (key === 'h') ratio2 = '2/1'
  else if (key === 'j') ratio2 = '3/2'
  else if (key === 'k') ratio2 = '4/3'
  else if (key === 'l') ratio2 = '5/4'
  else if (key === ';') ratio2 = '6/5'

       if (key === 'z') ratio3 = '5/6'
  else if (key === 'x') ratio3 = '4/5'
  else if (key === 'c') ratio3 = '3/4'
  else if (key === 'v') ratio3 = '2/3'
  else if (key === 'b') ratio3 = '1/2'
  else if (key === 'n') ratio3 = '2/1'
  else if (key === 'm') ratio3 = '3/2'
  else if (key === ',') ratio3 = '4/3'
  else if (key === '.') ratio3 = '5/4'
  else if (key === '/') ratio3 = '6/5'

  freq1 *= eval(ratio1)
  freq2 *= eval(ratio2)
  freq3 *= eval(ratio3)

  osc1.frequency.setValueAtTime(freq1, 0)
  osc2.frequency.setValueAtTime(freq2, 0)
  osc3.frequency.setValueAtTime(freq3, 0)

  output.innerHTML = `
    You shifted frequency1 with ratio1: ${ratio1}<br>
    Current frequency1: ${freq1.toFixed(2)}<br><br>
    You shifted frequency2 with ratio2: ${ratio2}<br>
    Current frequency2: ${freq2.toFixed(2)}<br><br>
    You shifted frequency3 with ratio3: ${ratio3}<br>
    Current frequency3: ${freq3.toFixed(2)}`
}

shiftFrequency()
document.addEventListener('keydown', (event) => {
  event.preventDefault()
  shiftFrequency(event.key)
})
