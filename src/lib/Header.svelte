<script>
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import SelectMenu from "./SelectMenu.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ProductMenu from "./ProductMenu.svelte";
  import { parsePeriodString } from "../js/utils";
  import { sendSerialCommand } from "../js/serial";

  export let connected;
  export let started;

  export let pointsOptions;
  export let numPoints;
  export let defaultPoints;

  export let periodOptions;
  export let periodString;
  export let defaultPeriod;

  export let voltageOptions;
  export let voltageString;
  export let defaultVoltage;

  const dispatch = createEventDispatcher();

  let isModalOpen = false;
  function handleProductSelect(event) {
    const selectedProduct = event.detail.product;
    // Handle the selected product
    console.log("Selected product:", selectedProduct);
  }
  $: selectProductText = "Select Product";
  $: startButtonText = !started ? "Start" : "Stop";
  $: startButtonColour = !started ? "green" : "red";
  function onStart() {
    dispatch("start");
    sendSerialCommand(">1A");
  }

  function onConnect() {
    dispatch("connect");
  }

  let connectButtonText;
  $: if ("serial" in navigator) {
    connectButtonText = !connected ? "Connect" : "Disconnect";
  } else {
    connectButtonText = "Browser doesn't support WebSerial";
  }

  // Variable to control sampling mode
  export let isPeriodicSampling = true;

  // Handle toggle change
  function onToggleChange(checked) {
    isPeriodicSampling = checked;
  }

  function samplingPeriodChange(event) {
    const period_s = parsePeriodString(event.detail.selected);
  }

  function voltageRangeChange(event) {
    const selectedVoltage = event.detail.selected;
  }
</script>

<div id="header">
  <img src="logo.svg" id="logo" alt="logo" />

  <div id="container-right">
    <Button
      bind:name={selectProductText}
      --background-color="var(--primary)"
      --color="var(--on-primary)"
      on:click={() => (isModalOpen = true)}
    />

    <ProductMenu
      isOpen={isModalOpen}
      on:close={() => (isModalOpen = false)}
      on:selectProduct={handleProductSelect}
      on:clearSelection={() => console.log("Selection cleared")}
    />

    <ToggleSwitch
      checked={isPeriodicSampling}
      onChange={onToggleChange}
      disabled={started}
    />

    <SelectMenu
      tooltip="Sampling Period"
      bind:selectedOption={periodString}
      options={periodOptions}
      defaultOption={defaultPeriod}
      on:change={samplingPeriodChange}
      disabled={started}
    />

    <SelectMenu
      tooltip="Voltage Range"
      bind:selectedOption={voltageString}
      options={voltageOptions}
      defaultOption={defaultVoltage}
      on:change={voltageRangeChange}
      disabled={started}
    />

    <SelectMenu
      tooltip="Points"
      bind:selectedOption={numPoints}
      options={pointsOptions}
      defaultOption={defaultPoints}
    />

    {#if connected}
      <Button
        bind:name={startButtonText}
        --background-color={startButtonColour}
        --color="white"
        on:click={onStart}
      />
    {/if}

    <Button
      bind:name={connectButtonText}
      --background-color="var(--primary)"
      --color="var(--on-primary)"
      on:click={onConnect}
    />
  </div>
</div>

<style>
  #header {
    background-color: var(--background-secondary);
    gap: 20px;

    height: 4rem; /* Fixed footer height */
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  #logo {
    height: 3rem;
  }

  #container-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
</style>
