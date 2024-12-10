<script>
  import { createEventDispatcher } from 'svelte'
  import Button from './Button.svelte'
  import SelectMenu from './SelectMenu.svelte'
  import ToggleSwitch from './ToggleSwitch.svelte';
  import { parsePeriodString } from '../js/utils';

  export let connected
  export let started

  export let pointsOptions
  export let numPoints
  export let defaultPoints

  export let periodOptions
  export let periodString
  export let defaultPeriod

  export let voltageOptions
  export let voltageString
  export let defaultVoltage

  const dispatch = createEventDispatcher()

  $: startButtonText = !started ? 'Start' : 'Stop'
  $: startButtonColour = !started ? 'green' : 'red'
  function onStart () {
    dispatch('start')
  }

  function onConnect () {
    dispatch('connect')
  }

  let connectButtonText
  $: if ('serial' in navigator) {
    connectButtonText = !connected ? 'Connect' : 'Disconnect'
  } else {
    connectButtonText = 'Browser doesn\'t support WebSerial'
  }

  // Variable to control sampling mode
  let isPeriodicSampling = true;

  // Handle toggle change
  function onToggleChange(checked) {
    isPeriodicSampling = checked;
    // Optionally, you can dispatch events here if needed
  }

  function samplingPeriodChange(event) {
    const period_s = parsePeriodString(event.detail.selected)
    // TODO: send command to logger
  }

  function voltageRangeChange(event) {
    const selectedVoltage = event.detail.selected;
    switch(selectedVoltage) {
      case "-1 to +1V":
        // Handle logic for -1 to +1V voltage range
        console.log('Voltage range set to -1 to +1V');
        // TODO: send the command to logger or update relevant state
        break;

      case "-5 to +5V":
        // Handle logic for -5 to +5V voltage range
        console.log('Voltage range set to -5 to +5V');
        // TODO: send the command to logger or update relevant state
        break;

      case "-50 to +50V":
        // Handle logic for -50 to +50V voltage range
        console.log('Voltage range set to -50 to +50V');
        // TODO: send the command to logger or update relevant state
        break;

      default:
        throw new Error(`Invalid voltage range selected: ${periodString}`);
        break;
    }
  }
</script>
<div id="header">
  <img src="logo.svg" id="logo" alt="logo">

  <div id="container-right">
    <ToggleSwitch 
      checked={isPeriodicSampling} 
      onChange={onToggleChange}
    />

    <SelectMenu
      tooltip="Sampling Period"
      bind:selectedOption={periodString}
      options={periodOptions}
      defaultOption={defaultPeriod}
      on:change={samplingPeriodChange}
    />

    <SelectMenu
      tooltip="Voltage Range"
      bind:selectedOption={voltageString}
      options={voltageOptions}
      defaultOption={defaultVoltage}
      on:change={voltageRangeChange}
    />

    <SelectMenu
      tooltip="Points"
      bind:selectedOption={numPoints}
      options={pointsOptions}
      defaultOption={defaultPoints}
    />

    {#if connected}
      <Button bind:name={startButtonText}
            --background-color={startButtonColour}
            --color=white
            on:click={onStart}
      />
    {/if}

    <Button bind:name={connectButtonText}
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
