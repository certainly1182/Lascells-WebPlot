<script>
    import { createEventDispatcher } from 'svelte'
    import Button from './Button.svelte'
    import Dropdown from './Dropdown.svelte'
    import SelectMenu from './SelectMenu.svelte'

    export let connected
    export let started

    export let pointsOptions
    export let numPoints
    export let defaultPoints

    export let periodOptions
    export let period
    export let defaultPeriod

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

</script>
<div id="header">
  <img src="logo.svg" id="logo" alt="logo">

  <div id="container-right">
    <SelectMenu
      tooltip="Sampling Period"
      bind:selectedOption={numPoints}
      options={pointsOptions}
      defaultOption={defaultPoints}
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
    display: flex;
    position: fixed;
    top: 0;
    background-color: var(--background-secondary);
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 10px 20px 10px 40px;
    gap: 20px;
  }

  #logo {
    width: 200px;
  }

  #container-right {
    display: flex;
    align-items: center;
    gap: 20px;
  }
</style>
