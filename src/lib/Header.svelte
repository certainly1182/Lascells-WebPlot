<script>
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import SelectMenu from "./SelectMenu.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ProductMenu from "./ProductMenu.svelte";
  import { parsePeriodString } from "../js/utils";
  import { sendSerialCommand } from "../js/serial";
  import { productStore } from "../js/store";

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

  let selectedProductName;
  productStore.subscribe(value => {
    selectedProductName = value.name || 'Select Product';
  })

  $: startButtonText = !started ? "Start" : "Stop";
  $: startButtonColour = !started ? "green" : "red";
  function onStart() {
    dispatch("start");
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
  <img src="logo.svg" id="logo" alt="logo" style="width: auto; height: 40px; color: red;"/>

  <div id="container-right">
    <button
      class="product-dropdown"
      on:click={() => (isModalOpen = true)}
      aria-haspopup="true"
      aria-expanded={isModalOpen}
    >
      <span class="product-name">{selectedProductName}</span>
      <span class="dropdown-arrow">▼</span>
    </button>

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

  .product-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 120px;
    height: 40px;
    padding: 0 15px;
    background-color: white;
    color: black;
    border: 2px solid var(--tertiary);
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
    min-width: 180px;
    justify-content: space-between;
    transition: background-color 0.2s;
  }

  .product-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  .dropdown-arrow {
    font-size: 0.8rem;
  }
</style>
