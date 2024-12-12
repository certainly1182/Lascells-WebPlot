import { serialLineStore, fullDataStore } from "./store.js";
import { parsePeriodString } from "./utils.js";

let port;
let reader;
const decoder = new TextDecoder();

let run = false;

export async function serialConnect(baudrate) {
  port = await navigator.serial.requestPort();
  await port.open({ baudRate: baudrate });
  reader = port.readable.getReader();
  run = true;

  fullDataStore.set([]);
}

export function serialDisconnect() {
  serialStop();
  reader.cancel();
  reader.releaseLock();
  port.close();
}

export function serialStop() {
  run = false;
}

let startTime;

export async function serialStart() {
  let line = "";
  run = true;
  startTime = performance.now();

  while (run) {
    const { value, done } = await reader.read();

    if (done) {
      serialDisconnect();
      break;
    }

    const data = decoder.decode(value);

    for (const char of data) {
      if (char === "\n") {
        line = line.replace(/[\r\n]+/gm, "");

        const elapsedTime = (performance.now() - startTime) / 1000;
        const currentTimestamp = elapsedTime.toFixed(3);

        const serialLine = `${currentTimestamp}, ${line}`; // Add timestamp to data
        serialLineStore.set(serialLine);

        const parsedData = line.split(",").map((val) => {
          const parsed = parseFloat(val.trim());
          return isNaN(parsed) ? null : parsed;
        });
        fullDataStore.update((currentData) => [...currentData, parsedData]);

        line = "";
      } else {
        line += char;
      }
    }
  }
}

export function exportFullDataToCSV() {
  let fullData = [];
  const unsubscribe = fullDataStore.subscribe((value) => {
    fullData = value;
  });
  unsubscribe();

  let csvContent = "Time (s),";

  if (fullData.length > 0) {
    for (let i = 0; i < fullData[0].length; i++) {
      csvContent += `Line ${i + 1},`;
    }
    csvContent = csvContent.slice(0, -1) + "\n";

    fullData.forEach((dataPoint, index) => {
      csvContent += `${index * 0.01},`; // TODO: use sampling period

      dataPoint.forEach((value) => {
        csvContent += `${value},`;
      });

      csvContent = csvContent.slice(0, -1) + "\n";
    });
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "chart_data.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function sendSerialCommand(command) {
  if (!port || port?.state !== "open") {
    console.error("Serial port is not open");
    return;
  }

  // Convert the command string to a Uint8Array
  const encoder = new TextEncoder();
  const commandBytes = encoder.encode(command);

  // Send the command through the serial port
  const writer = port.writable.getWriter();
  try {
    await writer.write(commandBytes);
    writer.releaseLock();
    console.log(`Sent command: ${command}`);
  } catch (error) {
    console.error("Error sending command:", error);
  }
}

export async function sendConfigCommand(periodString, voltageString) {
  try {
    const period = parsePeriodString(periodString);

    const samplingCode = {
      "Manual": "@",
      "1ms": "A",
      "2ms": "B",
      "5ms": "C",
      "10ms": "D",
      "25ms": "E",
      "50ms": "F",
      "100ms": "G",
      "200ms": "H",
      "500ms": "I",
      "1s": "J",
      "2s": "K",
      "5s": "L",
      "10s": "M",
      "15s": "N",
      "30s": "O",
      "1min": "P"
    }[periodString];

    if (!samplingCode) {
      throw new Error(`Invalid sampling period: ${periodString}`);
    }

    const voltageCode = {
      "Auto": "0",
      "-1 to +1V": "1",
      "-5 to +5V": "2",
      "-50 to +50V": "3",
    }[voltageString];

    if (!voltageCode) {
      throw new Error(`Invalid voltage range: ${voltageString}`);
    }

    const command = `${samplingCode}${voltageCode}`;

    await sendSerialCommand(command);
  } catch (error) {
    console.error("Error in sending serial command:", error);
  }
}
