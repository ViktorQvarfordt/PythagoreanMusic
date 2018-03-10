
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

let ground = 310;

let base = [2.0, 3.0];
console.log(base)

let maxIntervalChange = 3
let maxToneCoeff = 4
let maxAccordChange = 2;

let t = 0
let tones = [];
for (let i = -maxIntervalChange ; i < maxIntervalChange + 1; i++) {
    for (let j = -maxIntervalChange ; j < maxIntervalChange + 1; j++) {

        let tone = [i, j];
        let f = freq(base, tone);
        if (f > 0.5 && f < 2.0 ) {
            // osc.frequency.setValueAtTime(ground * f, audioCtx.currentTime + t/2);
            // t += 1;
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
let length = Math.floor(Math.random()*20);
length = 10
for (let i = 0 ; i < length ; i++) {
    let [t1, f1] = newTone(tone, maxIntervalChange)
    let [t2, f2] = newTone(t1, maxAccordChange)
    tone = t1
    console.log(t1, t2, f1, f2)
    osc.frequency.setValueAtTime(ground * f1, audioCtx.currentTime + t/2);
    osc2.frequency.setValueAtTime(ground * f2, audioCtx.currentTime + t/2);
    let diff = (Math.floor(Math.random()*2) + 1)/2;
    t += diff;
}

osc.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime + t/2);
osc2.connect(audioCtx.destination);
osc2.start();
osc2.stop(audioCtx.currentTime + t/2);
