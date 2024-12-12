import { serialLineStore, fullDataStore } from "./store.js";

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
