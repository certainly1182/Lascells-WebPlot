<script>
  import { createEventDispatcher } from "svelte";
  import Button from "./Button.svelte";
  import SelectMenu from "./SelectMenu.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import ProductMenu from "./ProductMenu.svelte";
  import { parsePeriodString } from "../js/utils";
  import { productStore, isPeriodicSamplingStore, displayModeStore, connectionStatusStore, voltageRangeStore, voltageRanges, defaultVoltageRange } from "../js/store";
  import { sendSerialCommand } from "../js/serial";

  export let connected;
  export let started;

  export let pointsOptions;
  export let numPoints;
  export let defaultPoints;

  export let periodOptions;
  export let periodString;
  export let defaultPeriod;

  export let voltageString;
  voltageRangeStore.subscribe(value => {
    voltageString = value;
  });

  const displayModeOptions = ['Graph', 'Numeric'];
  let displayMode = displayModeOptions[0];

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
    displayModeStore.set(displayMode);
  }

  let connectionStatus;
  connectionStatusStore.subscribe(status => {
    connectionStatus = status;
    connected = status.connected;
  });

  let connectButtonText;
  let connectButtonIcon;
  let connectButtonTitle;
  $: connectButtonText = "serial" in navigator 
    ? (!connected ? "Connect" : "Disconnect")
    : "Browser doesn't support WebSerial";
  $: connectButtonIcon = !connected ? "plug-circle-plus" : "plug-circle-xmark";
  $: connectButtonTitle = !connected 
    ? "Connect" 
    : connectionStatus?.error 
      ? `Error: ${connectionStatus.error}`
      : "Disconnect";
  $: connectButtonColor = connectionStatus?.error 
    ? "red" 
    : "var(--primary)";

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
    voltageRangeStore.set(event.detail.selected);
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
      <div class="product-wrapper">
        <button
          class="product-dropdown"
          on:click={() => (isModalOpen = true)}
          aria-haspopup="true"
          aria-expanded={isModalOpen}
          disabled={started}
        >
          <span class="product-name">{selectedProductName}</span>
        </button>
        <button 
          class="dropdown-arrow-button" 
          on:click={() => (isModalOpen = true)}
          disabled={started}
        >
          ▼
        </button>
      </div>

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
        --background-color={connectButtonColor}
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
        options={voltageRanges}
        defaultOption={defaultVoltageRange}
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
    z-index: 100000;
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

  .product-wrapper {
  display: flex;
  align-content: center;
  z-index: 60;
}

.product-dropdown {
  background-color: transparent;
  padding: 0 15px;
  border: 2px solid var(--tertiary);
  border-radius: 20px 0 0 20px;
  outline: none;
  width: 140px;
  height: 40px;
  cursor: pointer;
  line-height: 45px;
  font-size: 16px;
  color: var(--tertiary);
  text-align: left;
  display: flex;
  align-items: center;
}

.dropdown-arrow-button {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: transparent;
  border: 2px solid var(--tertiary);
  border-radius: 0 20px 20px 0;
  margin-left: -2px;
  height: 40px;
  width: 40px;
  color: var(--tertiary);
  transition: 0.2s;
  cursor: pointer;
}

/* Disabled states */
.product-dropdown:disabled,
.dropdown-arrow-button:disabled {
  background-color: #f0f0f0;
  color: #b0b0b0;
  border-color: #d0d0d0;
  cursor: not-allowed;
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}
</style>
