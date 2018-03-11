/* eslint-env browser */


const audioCtx = new AudioContext()
const masterGain = audioCtx.createGain()
masterGain.connect(audioCtx.destination)

const osc = audioCtx.createOscillator()
osc.connect(masterGain)
osc.frequency.setValueAtTime(300, 0)
osc.start()


document.addEventListener('keydown', (event) => {
  let newFreq = osc.frequency.value
  if (event.key === 'a') {
    newFreq *= 5/6
  } else if (event.key === 's') {
    newFreq *= 4/5
  } else if (event.key === 'd') {
    newFreq *= 3/4
  } else if (event.key === 'f') {
    newFreq *= 2/3
  } else if (event.key === 'g') {
    newFreq *= 1/2
  } else if (event.key === 'h') {
    newFreq *= 2/1
  } else if (event.key === 'j') {
    newFreq *= 3/2
  } else if (event.key === 'k') {
    newFreq *= 4/3
  } else if (event.key === 'l') {
    newFreq *= 5/4
  } else if (event.key === ';') {
    newFreq *= 6/5
  }
  osc.frequency.setValueAtTime(newFreq, 0)
})
