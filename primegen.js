
console.log("HEJ")

function range(start, end, step) {
  const _end = end || start;
  const _start = end ? start : 0;
  const _step = step || 1;
  return Array((_end - _start) / _step).fill(0).map((v, i) => _start + (i * _step));
}

function freq(base, tone) {
    let res = 1;
    for (let i = 0 ; i < base.length ; i++) {
        res *= base[i]**tone[i];
    }
    return res
}

function add(tone1, tone2) {
    let tone = [];
    for (let i = 0 ; i < tone1.length ; i++) {
        tone.push(tone1[i] + tone2[i])
    }
    return tone
}

let audioCtx = new AudioContext();
let osc = audioCtx.createOscillator();
osc.type = 'square';
let osc2 = audioCtx.createOscillator();
osc2.type = 'square';

let ground = 300;

let base = [2.0, 3.0];
console.log(base)

let maxIntervalChange = 3
let maxToneCoeff = 4
let maxAccordChange = 2;

let tones = [];
for (let i = -maxIntervalChange ; i < maxIntervalChange + 1; i++) {
    for (let j = -maxIntervalChange ; j < maxIntervalChange + 1; j++) {

        let tone = [i, j];
        let f = freq(base, tone);
        if (f > 0.5 && f < 2.0 ) {
            console.log(tone, f);
            tones.push(tone);
        }
    }
}

function getInterval(maxIntervalChange) {
    let idx = Math.floor(Math.random()*tones.length);
    while (
        Math.max.apply(null, tones[idx]) > maxIntervalChange || 
        Math.min.apply(null, tones[idx]) < -maxIntervalChange)
    {
        idx = Math.floor(Math.random()*tones.length);
    }
    return tones[idx];
}


function newTone(tone, maxIntervalChange) {
    let interval = getInterval(maxIntervalChange);
    let t = add(tone, interval);
    let f = freq(base, t)
    while (
        f > 2.0 || f < 0.5 || 
        Math.max.apply(null, t) > maxToneCoeff || 
        Math.min.apply(null, t) < -maxToneCoeff)
    {
        interval = getInterval(maxIntervalChange);
        t = add(tone, interval);
        f = freq(base, t)
    }
    return [t, f]
}


let tone = [0, 0];
song = [[]]

let t = 0
for (let j = 0 ; j < 3 ; j++){
  let length = t + 2**Math.floor(Math.random());
  length=5
  block = []

  while (t < length) {
    let [t1, f1] = newTone(tone, maxIntervalChange)
    let [t2, f2] = newTone(t1, maxAccordChange)

    tone = t1
    console.log(t1, t2, f1, f2)
    osc.frequency.setValueAtTime(ground * f1, audioCtx.currentTime + t);
    osc2.frequency.setValueAtTime(ground * f2, audioCtx.currentTime + t);

    let diff = 0.5**Math.floor(Math.random()*2)/2
    if (diff + t > length) {
      diff = length - t
    }
    t += diff;

    block.push([[t1, t2], diff])
  }
  song[0].push(block)
}

for (let level = 1 ; level < 2 ; level++) {
song.push([])
  // for (let i = 0 ; i < 3 ; i++){
    let block = []
    let length = Math.floor(Math.random()*3) + 1
    length = 10
    for (let j = 0 ; j < length ; j++){
      let idx = Math.floor(Math.random()*song[level-1].length)
      block.push(idx)
    }
    song[level].push(block)
  // }
}


let fl = false
if (fl) {
osc.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime + t);
osc2.connect(audioCtx.destination);
osc2.start();
osc2.stop(audioCtx.currentTime + t);
}

document.getElementById('input').value = JSON.stringify(song)

class Player {
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
      osc.type = 'square';
      osc.frequency.setValueAtTime(0, 0)
      osc.start()
      this.oscs.push(osc)
    }
  }

  flatten(song, start) {
    const above = song.slice(0, song.length-1)
    const level = song[song.length-1]
    const block = level[start]

    if (song.length == 1) {
      return block
    }

    let res = []

    for (let i = 0; i < block.length; i++) {
      const ref = block[i]
      const flat_block = this.flatten(above, ref)
      res = res.concat(flat_block)
    }
    return res
  }

  play(song) {
    this.initOscillators()

    const baseFreq = 300
    const toneLength = 0.5 // seconds
    let t = this.audioCtx.currentTime

    let block = this.flatten(song, 0)
    block.push([[], 0]) // End with silence
    console.log(block)

    for (let i = 0; i < block.length; i++) {
      const tones = block[i][0]

      for (let j = 0; j < this.oscs.length; j++) {
        const osc = this.oscs[j]

        // Only activate as many oscillators as there are specified ratios
        let f = 0
        if (j < tones.length) {
          f = freq(base, tones[j])
        }

        osc.frequency.setValueAtTime(baseFreq * f, t)
        // Avoid clipping:
        this.masterGain.gain.setValueAtTime(2.0 / Math.max(1, tones.length), t)
      }
      t += block[i][1]
    }
  }
}

const player = new Player()

document.addEventListener('keydown', (event) => {
  if (!(event.key === 'Enter' && event.ctrlKey)) return
  // Delay execution until next event loop so that DOM has time to update
  setTimeout(() => {
    const song = document.getElementById('input').value
    player.play(JSON.parse(song))
  }, 0)
})



