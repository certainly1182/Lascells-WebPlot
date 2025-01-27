import { writable } from "svelte/store";

export const serialLineStore = writable("");
export const fullDataStore = writable([]);

export const productStore = writable({
  name: null,
  scale: 1,
  unit: "Volts (V)",
});

export function transformVoltageData(voltageData, scale = 1) {
  if (!voltageData || voltageData === "") return "";

  const values = voltageData.split(",");
  const transformedValues = values.map((val, index) => {
    // First value is time/index, don't scale it
    if (index === 0) return val;

    const numVal = parseFloat(val);
    return isNaN(numVal) ? val : (numVal * scale).toFixed(3);
  });

  return transformedValues.join(",");
}

export const isPeriodicSamplingStore = writable(true);

export const connectionStatusStore = writable({ connected: false, error: null });

export const displayModeOptions = ['Graph', 'Numeric'];
export const displayModeStore = writable(displayModeOptions[0]);

export const toastStore = writable(null);
export function showToast(message) {
  toastStore.set(message);
}