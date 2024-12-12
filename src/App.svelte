<!-- App.svelte -->

<script>
  import {
    serialConnect,
    serialDisconnect,
    serialStart,
    serialStop,
  } from "./js/serial";
  import { serialLineStore } from "./js/store.js";

  import Header from "./lib/Header.svelte";
  import Chart from "./lib/Chart.svelte";
  import Footer from "./lib/Footer.svelte";

  let pointsOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000];
  let defaultPoints = pointsOptions[5];
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
  let periodString;

  let voltageOptions = ["-1 to +1V", "-5 to +5V", "-50 to +50V"];
  let defaultVoltage = voltageOptions[2];
  let voltageString;

  let connected = false;
  let started = false;

  let chartRef;

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
    if (!started) {
      clearChart();
      serialStart();
    } else {
      serialStop();
    }
    started = !started;
  }

  function onConnect() {
    !connected ? connect() : disconnect();
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
  />

  <main>
    <Chart bind:numPoints bind:this={chartRef} />
  </main>

  <Footer />
</div>

<style>
  #app {
    display: flex;
    flex-direction: column;
    height: 100vh; /* Full viewport height */
    overflow: hidden; /* Prevent scrolling */
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
