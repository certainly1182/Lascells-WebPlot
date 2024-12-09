<script>
  import { serialConnect, serialDisconnect, serialStart, serialStop } from './js/serial'
  import { serialLineStore } from './js/store.js'
  
  import Header from './lib/Header.svelte'
  import Chart from './lib/Chart.svelte'
  import Footer from './lib/Footer.svelte'

  let pointsOptions = [10, 20, 50, 100, 500, 1000, 5000, 10000, 50000, 100000]
  let defaultPoints = pointsOptions[2]
  let numPoints

  let periodOptions = ['1 ms', '2 ms', '5 ms', '10 ms', '25 ms', '50 ms', '100 ms', '200 ms', '500 ms', '1 s', '2 s', '5 s', '10 s', '15 s', '30 s']

  let connected = false
  let started = false

  async function connect () {
    await serialConnect(115200)
    connected = true
  }

  function disconnect () {
    serialDisconnect()
    connected = false
    started = false
    $serialLineStore = ''
  }

  function onStart () {
    !started ? serialStart() : serialStop()
    started = !started
  }

  function onConnect () {
    !connected ? connect() : disconnect()
  }
</script>

<Header
  bind:connected
  bind:started

  bind:numPoints
  pointsOptions={pointsOptions}
  bind:defaultPoints

  on:start={onStart}
  on:connect={onConnect}
/>

<main>
  {#if !connected}
    <img src="logo.svg" id="logo" alt="logo">
  {/if}

  {#if connected}
    <Chart bind:numPoints/>
  {/if}
</main>

<Footer

/>

<style>
  #logo {
    position: fixed;
    width: 150px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }
</style>
