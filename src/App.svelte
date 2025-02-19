<!-- App.svelte -->
<script>
  import {
    serialConnect,
    serialDisconnect,
    serialStart,
    serialStop,
    sendConfigCommand,
    sendSerialCommand,
  } from "./js/serial";
  import { serialLineStore, isPeriodicSamplingStore, displayModeStore, connectionStatusStore, showToast, voltageRangeStore, defaultVoltageRange } from "./js/store.js";

  import Toast from "./lib/Toast.svelte";
  import Header from "./lib/Header.svelte";
  import Chart from "./lib/Chart.svelte";
  import NumericDisplay from "./lib/NumericDisplay.svelte";
  import Footer from "./lib/Footer.svelte";

  let pointsOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];
  let defaultPoints = pointsOptions[3];
  let numPoints;

  let periodOptions = [
    "2ms",
    "5ms",
    "10ms",
    "25ms",
    "50ms",
    "100ms",
    "200ms",
    "500ms",
    "1s",
    "2s",
    "5s",
    "10s",
    "15s",
    "30s",
    "1min",
  ];
  let defaultPeriod = periodOptions[5];
  let periodString = defaultPeriod;
  
  let chartRef;

  let voltageString;
  voltageRangeStore.subscribe(value => {
    voltageString = value;
    if (chartRef) {
      chartRef.resetView();
    }
  });

  let connected = false;
  let started = false;

  let isPeriodicSampling = true;
  isPeriodicSamplingStore.subscribe((value) => {
    isPeriodicSampling = value;
  });

  $: updateVoltage(voltageString);
  function updateVoltage(newVoltage) {
    if (chartRef) {
      chartRef.resetView();
    }
  }

  let displayMode = 'Chart';
  displayModeStore.subscribe((value) => {
    displayMode = value;
  })

  function clearChart() {
    chartRef.clearChartData();
  }

  async function connect() {
    try {
      await serialConnect(115200);
      connected = true;
    } catch (error) {
      connected = false;
      showToast(error.message || "Failed to connect to device");
    }
  }

  function disconnect() {
    try {
      serialDisconnect();
    } finally {
      connected = false;
      started = false;
      $serialLineStore = "";
    }
  }

  function onStart() {
    if (!connected) {
      console.error("Serial port is not open");
      return;
    }
    if (!started) {
      clearChart();
      serialStart();
      if (!isPeriodicSampling) {
        sendConfigCommand("Manual", voltageString);
      } else {
        sendConfigCommand(periodString, voltageString);
      }
    } else {
      serialStop();
    }
    started = !started;
  }

  function onConnect() {
    !connected ? connect() : disconnect();
  }

  import { onMount, onDestroy } from "svelte";

  onMount(() => {
    window.addEventListener("keydown", handleSpacebar);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", handleSpacebar);
  });

  function handleSpacebar(event) {
    if (!connected) return;
    if (isPeriodicSampling) return;
    if (event.code !== "Space") return;
    sendSerialCommand("#");
  }
</script>

<div id="app">
  <Toast />
  <Header
    bind:connected
    bind:started
    bind:numPoints
    {pointsOptions}
    bind:defaultPoints
    bind:periodString
    {periodOptions}
    bind:defaultPeriod
    bind:voltageString
    on:start={onStart}
    on:connect={onConnect}
  />

  <main>
    <Chart
      bind:numPoints
      bind:this={chartRef}
      bind:isPeriodicSampling
      bind:voltageString
    />
    <NumericDisplay
      hidden={displayMode !== 'Numeric'}
    />
  </main>

  <Footer />
</div>

<style>
  #app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  main {
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 0;
  }
</style>
