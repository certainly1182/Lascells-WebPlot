<!-- App.svelte -->

<script>
  import {
    serialConnect,
    serialDisconnect,
    serialStart,
    serialStop,
    sendConfigCommand,
    sendSerialCommand
  } from "./js/serial";
  import { serialLineStore } from "./js/store.js";

  import Header from "./lib/Header.svelte";
  import Chart from "./lib/Chart.svelte";
  import Footer from "./lib/Footer.svelte";

  let pointsOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];
  let defaultPoints = pointsOptions[3];
  let numPoints;

  let periodOptions = [
    "1ms",
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
  let defaultPeriod = periodOptions[6];
  let periodString = defaultPeriod;

  let voltageOptions = ["-1 to +1V", "-5 to +5V", "-50 to +50V"];
  let defaultVoltage = voltageOptions[2];
  let voltageString = defaultVoltage;

  let connected = false;
  let started = false;

  let chartRef;

  let isPeriodicSampling = true;

  function clearChart() {
    chartRef.clearChartData();
  }

  async function connect() {
    await serialConnect(115200);
    connected = true;
  }

  function disconnect() {
    serialDisconnect();
    connected = false;
    started = false;
    $serialLineStore = "";
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

  import { onMount, onDestroy } from 'svelte';
  import PanelMeter from "./lib/PanelMeter.svelte";

  onMount(() => {
    window.addEventListener('keydown', handleSpacebar);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleSpacebar);
  });

  function handleSpacebar(event) {
    if(!connected) return;
    if (isPeriodicSampling) return;
    if (event.code !== 'Space') return;
    sendSerialCommand('#');
  }
</script>

<div id="app">
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
    {voltageOptions}
    bind:defaultVoltage
    on:start={onStart}
    on:connect={onConnect}
    bind:isPeriodicSampling
  />

  <main>
    <Chart bind:numPoints bind:this={chartRef} bind:isPeriodicSampling/>
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
