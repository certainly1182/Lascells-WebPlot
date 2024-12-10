function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function getRandomColor () {
  const r = Math.floor(getRandomInt(100, 256))
  const g = Math.floor(getRandomInt(100, 256))
  const b = Math.floor(getRandomInt(100, 256))

  const hexR = r.toString(16).padStart(2, '0')
  const hexG = g.toString(16).padStart(2, '0')
  const hexB = b.toString(16).padStart(2, '0')

  const hex = `#${hexR}${hexG}${hexB}`

  return hex
}

export function parsePeriodString(periodString) {
  const units = {ms: 0.001, s: 1, min: 60};
  const match = periodString.match(/(\d+)(ms|s|min)/);

  if(match) {
    const [, value, unit] = match;
    return parseFloat(value) * units[unit];
  }

  throw new Error(`Invalid period string: ${periodString}`)
}

export function createSineWaveData(numPoints) {
  const xData = Array.from({ length: numPoints }, (_, i) => i);
  const yData = xData.map(x => Math.sin(x * 0.1) * 5);
  return [xData, yData];
}
