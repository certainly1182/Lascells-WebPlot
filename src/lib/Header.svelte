<script>
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import SelectMenu from "./SelectMenu.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ProductMenu from "./ProductMenu.svelte";
  import { parsePeriodString } from "../js/utils";
  import { productStore, isPeriodicSamplingStore } from "../js/store";
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

  const displayModeOptions = ["Graph", "Numeric"];
  export let displayMode = displayModeOptions[0];

  const dispatch = createEventDispatcher();

  let isModalOpen = false;
  function handleProductSelect(event) {
    const selectedProduct = event.detail.product;
    // Handle the selected product
    console.log("Selected product:", selectedProduct);
  }

  let selectedProductName;
  productStore.subscribe((value) => {
    selectedProductName = value.name || "Select Product";
  });

  $: startButtonIcon = started ? "stop" : "play";
  $: startButtonColour = !started ? "green" : "red";
  $: startButtonTitle = !started ? "Start Logging" : "Stop Logging";
  function onStart() {
    dispatch("start");
  }

  function onConnect() {
    dispatch("connect");
  }

  function onDisplayModeChange(event) {
    displayMode = event.detail.selected;
    dispatch("displayModeChange", { mode: displayMode });
  }

  let connectButtonText;
  let connectButtonIcon;
  let connectButtonTitle;
  $: if ("serial" in navigator) {
    connectButtonText = !connected ? "Connect" : "Disconnect";
    connectButtonIcon = !connected ? "plug-circle-plus" : "plug-circle-xmark";
    connectButtonTitle = !connected ? "Connect" : "Disconnect";
  } else {
    connectButtonText = "Browser doesn't support WebSerial";
  }

  // Variable to control sampling mode
  let isPeriodicSampling;
  isPeriodicSamplingStore.subscribe((value) => {
    isPeriodicSampling = value;
  });

  // Handle toggle change
  function onToggleChange(checked) {
    isPeriodicSamplingStore.set(checked);
  }

  function samplingPeriodChange(event) {
    const period_s = parsePeriodString(event.detail.selected);
  }

  function voltageRangeChange(event) {
    const selectedVoltage = event.detail.selected;
  }
</script>

<div id="header">
  <div class="header-row top-row">
    <img
      src="lascells_Logo_Blue.png"
      id="logo"
      alt="logo"
      loading="lazy"
    />

    <div class="primary-controls">
      <SelectMenu
        tooltip="Display Mode"
        bind:selectedOption={displayMode}
        options={displayModeOptions}
        on:change={onDisplayModeChange}
      />
      <button
        class="product-dropdown"
        on:click={() => (isModalOpen = true)}
        aria-haspopup="true"
        aria-expanded={isModalOpen}
        disabled={started}
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

      <Button
        icon={startButtonIcon}
        title={startButtonTitle}
        --background-color={startButtonColour}
        --color="white"
        on:click={onStart}
        disabled={!connected}
      />

      <Button
        icon={connectButtonIcon}
        title={connectButtonTitle}
        --background-color="var(--primary)"
        --color="var(--on-primary)"
        on:click={onConnect}
      />
    </div>
  </div>

  <div class="header-row bottom-row">
    <div class="secondary-controls">
      <div class="sampling-controls">
        {#if isPeriodicSampling}
          <SelectMenu
            tooltip="Sampling Period"
            bind:selectedOption={periodString}
            options={periodOptions}
            defaultOption={defaultPeriod}
            on:change={samplingPeriodChange}
            disabled={started}
          />
        {:else}
          <Button
          name="Take Sample"
          title="Spacebar also Samples"
          --background-color="var(--primary)"
          --color="var(--on-primary)"
          on:click={() => sendSerialCommand("#") }
          disabled={!connected}
          />
        {/if}
      </div>

      <SelectMenu
        tooltip="Voltage Range"
        bind:selectedOption={voltageString}
        options={voltageOptions}
        defaultOption={defaultVoltage}
        on:change={voltageRangeChange}
        disabled={started}
      />

      {#if displayMode === "Graph"}
        <SelectMenu
          tooltip="Points"
          bind:selectedOption={numPoints}
          options={pointsOptions}
          defaultOption={defaultPoints}
        />
      {/if}
    </div>
  </div>
</div>

<style>
  #header {
    background-color: var(--background-secondary);
    display: flex;
    flex-direction: column;
  }

  .header-row {
    padding: 0.2rem;
    display: flex;
    align-items: center;
  }

  .top-row {
    justify-content: space-between;
    border-bottom: 1px solid var(--border-color);
  }

  .bottom-row {
    justify-content: flex-end;
  }

  #logo {
    height: 2.5rem;
    width: auto;
  }

  .primary-controls, .secondary-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .sampling-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .product-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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
