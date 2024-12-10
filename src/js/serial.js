import { serialLineStore } from './store.js'

let port
let reader
const decoder = new TextDecoder()

let run = false

export async function serialConnect (baudrate) {
  port = await navigator.serial.requestPort()
  await port.open({ baudRate: baudrate })
  reader = port.readable.getReader()
  run = true
}

export function serialDisconnect () {
  serialStop()
  reader.cancel()
  reader.releaseLock()
  port.close()
}

export function serialStop () {
  run = false
}

let startTime

export async function serialStart () {
  let line = ''
  run = true
  startTime = performance.now()

  while (run) {
    const { value, done } = await reader.read()

    if (done) {
      serialDisconnect()
      break
    }

    const data = decoder.decode(value)

    for (const char of data) {
      if (char === '\n') {
        line = line.replace(/[\r\n]+/gm, '')

        const elapsedTime = (performance.now() - startTime) / 1000;
        const currentTimestamp = elapsedTime.toFixed(3)

        const serialLine = `${currentTimestamp}, ${line}` // Add timestamp to data
        serialLineStore.set(serialLine)
        line = ''
      } else {
        line += char
      }
    }
  }
}
