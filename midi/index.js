const listInputsAndOutputs = midiAccess => {
  for (let entry of midiAccess.inputs) {
    let input = entry[1];
    console.log( "Input port [type:'" + input.type + "'] id:'" + input.id +
      "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
      "' version:'" + input.version + "'" );
  }

  for (let entry of midiAccess.outputs) {
    let output = entry[1];
    console.log( "Output port [type:'" + output.type + "'] id:'" + output.id +
      "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
      "' version:'" + output.version + "'" );
  }
}

const getOutput = midiAccess => midiAccess.outputs.values().next().value

const noteOn = 0x90
const noteOff = 0x80

const getSym = n => {
  const ms = []
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= n; j++) {
      ms.push({
        [i]: [j]
      })
    }
  }
}

const perms = (arr) => {
  if (arr.length < 2 ) return arr
  const permutationsArray = []

  for (let i = 0; i < arr.length; i++){
    const el = arr[i]
    const tail = [...arr.slice(0, i), ...arr.slice(i + 1)]
    for (let permutation of perms(tail)) {
      permutationsArray.push([el, permutation].flat())
    }
  }
  return permutationsArray
}

const playFifths = output => {
  d = 250
  const schedule = (D, note) => {
    output.send([noteOn, note, 127], window.performance.now() + D)
    output.send([noteOff, note, 127], window.performance.now() + D + d)
  }

  schedule(d * 0, 60)
  schedule(d * 1, 67)
  schedule(d * 2, 62)
  schedule(d * 3, 69)
  schedule(d * 4, 64)
  schedule(d * 5, 71)
  schedule(d * 6, 66)
  schedule(d * 7, 61)
  schedule(d * 8, 68)
  schedule(d * 9, 63)
  schedule(d * 10, 70)
  schedule(d * 11, 65)
  schedule(d * 12, 72)
  schedule(d * 12, 60)
}

const play = output => {
  d = 140 / 60 / 4 * 1000

  const schedule = (D, note, duration, velocity) => {
    output.send([noteOn, note, velocity || 63], window.performance.now() + D)
    output.send([noteOff, note, velocity || 63], window.performance.now() + D + duration)
  }

  // const arr = [0, 2, 4, 5, 7, 9, 11, 12]
  const arr = [1,3,6,8,10]
  let count = 0
  for (const [i, perm] of perms(arr).entries()) {
    for (const [j, note] of perm.entries()) {
      if (j === 0) {
        schedule(d * (i * arr.length + j), 49, d * 0.8)
      }
      if (j === 2) {
        schedule(d * (i * arr.length + j), 51, d * 0.8, 50)
      }
      if (j === 4) {
        schedule(d * (i * arr.length + j), 58, d * 0.8, 50)
      }
      schedule(d * (i * arr.length + j), 60 + note, d * 0.8)
      count++
      if (count > 50) return
    }
  }
}

const main = () => {
  navigator.requestMIDIAccess().then(
    midiAccess => {
      // listInputsAndOutputs(midiAccess)
      play(getOutput(midiAccess))
    },
    msg => {
      console.log("Failed to get MIDI access - " + msg)
      alert("Failed to get MIDI access - " + msg)
    }
  )
}

main()
