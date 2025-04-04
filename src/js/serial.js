import {
  serialLineStore,
  fullDataStore,
  isPeriodicSamplingStore,
  connectionStatusStore,
  showToast,
  deviceInfoStore,
} from "./store.js";
import { parsePeriodString } from "./utils.js";

let port;
let reader;
const decoder = new TextDecoder();

let run = false;

let isPeriodicSampling = true;
isPeriodicSamplingStore.subscribe((value) => {
  isPeriodicSampling = value;
});

async function readIdResponse(portInfo) {
  let response = '';
  const idResponseTimeout = 1000; // 1 second timeout
  
  // Create abort controller for timeout
  const abortController = new AbortController();
  const signal = abortController.signal;
  
  // Set timeout
  const timeoutId = setTimeout(() => {
    abortController.abort();
  }, idResponseTimeout);

  try {
    while (true) {
      // Use Promise.race to handle timeout
      const { value, done } = await Promise.race([
        reader.read(),
        new Promise((_, reject) => {
          signal.addEventListener('abort', () => {
            reject(new Error('Timeout waiting for device ID'));
          });
        })
      ]);
      
      if (done) {
        throw new Error("Serial port closed while waiting for ID");
      }

      response += decoder.decode(value);
      
      if (response.includes('\n')) {
        response = response.trim();
        if (response.startsWith("ID=")) {
          const deviceId = response.substring(3).trim();
          const deviceName = getDeviceId(deviceId);
          deviceInfoStore.set({ 
            id: deviceId, 
            name: deviceName
          });
          return;
        }
      }
    }
  } catch (error) {
    console.error("Error reading ID response:", error);
    // Release the reader lock and cleanup
    reader.releaseLock();
    reader = port.readable.getReader();
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getDeviceId(deviceId) {
  const deviceMap = {
    'VOLT0': 'USB Voltmeter',
    // Add more device mappings as needed
  };
  return deviceMap[deviceId] || 'Unknown Device';
}

export async function serialConnect(baudrate) {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: baudrate, bufferSize: 65536 });
    reader = port.readable.getReader();
    run = true;
    console.log("Serial port opened successfully");
    connectionStatusStore.set({ connected: true, error: null });
    fullDataStore.set([]);

    // await sendSerialCommand(">ID\n");
    // await readIdResponse();

    // Listen for disconnect events
    navigator.serial.addEventListener("disconnect", (event) => {
      if (event.target === port) {
        handleDisconnection("Device was disconnected");
      }
    });
  } catch (error) {
    console.error("Error during serial connection:", error);
    connectionStatusStore.set({
      connected: false,
      error: "Failed to connect to device: " + error.message,
    });

    throw error;
  }

  fullDataStore.set([]);
}

function handleDisconnection(message) {
  console.error(message);
  run = false;
  connectionStatusStore.set({ connected: false, error: message });
  showToast(message);

  if (reader) {
    try {
      reader.releaseLock();
    } catch (error) {
      console.error("Error releasing reader lock:", error);
    }
  }

  if (port) {
    try {
      port.close();
    } catch (error) {
      console.error("Error closing port:", error);
    }
  }

  reader = null;
  port = null;
}

export function serialDisconnect() {
  deviceInfoStore.set({id:null, name:"None"});
  try {
    serialStop();
    if (reader) {
      reader.cancel();
      reader.releaseLock();
    }
    if (port) {
      port.close();
    }
    connectionStatusStore.set({ connected: false, error: null });
  } catch (error) {
    console.error("Error during disconnect:", error);
    handleDisconnection("Error during manual disconnect: " + error.message);
  }
}

export function serialStop() {
  run = false;
}

let startTime;

export async function serialStart() {
  let line = "";
  run = true;
  startTime = performance.now();
  let index = 0;

  while (run) {
    try {
      const { value, done } = await reader.read();

      if (done) {
        serialDisconnect();
        break;
      }

      const data = decoder.decode(value);

      for (const char of data) {
        if (char === "\n") {
          line = line.replace(/\r\n/g, "\n");

          const serialLine = isPeriodicSampling
            ? `${((performance.now() - startTime) / 1000).toFixed(3)}, ${line}`
            : `${index}, ${line}`;

          serialLineStore.set(serialLine);

          const parsedData = line.split(",").map((val) => {
            const parsed = parseFloat(val.trim());
            return isNaN(parsed) ? null : parsed;
          });
          fullDataStore.update((currentData) => [...currentData, parsedData]);

          line = "";
          index++;
        } else {
          line += char;
        }
      }
    } catch (error) {
      handleDisconnection("Lost connection to device: " + error.message);
      break;
    }
  }
}

export function exportFullDataToCSV() {
  let fullData = [];
  const unsubscribe = fullDataStore.subscribe((value) => {
    fullData = value;
  });
  unsubscribe();

  let csvContent = isPeriodicSampling ? "Time (s)," : "Index,";

  if (fullData.length > 0) {
    for (let i = 0; i < fullData[0].length; i++) {
      csvContent += `Line ${i + 1},`;
    }
    csvContent = csvContent.slice(0, -1) + "\n";

    fullData.forEach((dataPoint, index) => {
      csvContent += isPeriodicSampling
        ? `${index * 0.01},` // TODO: use sampling period
        : `${index},`;

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
  if (!port) {
    const error = "Port not open!"
    console.error(error);
    connectionStatusStore.set({ connected: false, error });
    return;
  }

  // Convert the command string to a Uint8Array
  const encoder = new TextEncoder();
  const commandBytes = encoder.encode(command);

  // Send the command through the serial port
  const writer = port.writable.getWriter();
  try {
    await writer.write(commandBytes);
    console.log(`Sent command: ${command}`);
  } catch (error) {
    console.error("Error sending command:", error);
    handleDisconnection('Failed to send command: ' + error.message);
  } finally {
    writer.releaseLock();
  }
}

export async function sendConfigCommand(periodString, voltageString) {
  try {
    const samplingCode = {
      Manual: ".",
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
      "1min": "P",
    }[periodString];

    if (!samplingCode) {
      throw new Error(`Invalid sampling period: ${periodString}`);
    }

    const voltageCode = {
      Auto: "0",
      "-2 to +2V": "1",
      "-20 to +20V": "2",
      "-200 to +200V": "3",
    }[voltageString];

    if (!voltageCode) {
      throw new Error(`Invalid voltage range: ${voltageString}`);
    }

    const command = `>${samplingCode}${voltageCode}\n`;

    await sendSerialCommand(command);
  } catch (error) {
    console.error("Error in sending serial command:", error);
  }
}