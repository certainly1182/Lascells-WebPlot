<script>
  import { createEventDispatcher } from "svelte";

  export let tooltip;
  export let options;
  export let defaultOption = undefined;
  export let selectedOption = !defaultOption ? options[0] : defaultOption;
  export let disabled = false;

  let open = false;
  let menuWrapper;

  const dispatch = createEventDispatcher();

  function toggleMenu() {
    open = !open;
  }

  function selectOption(option) {
    selectedOption = option;
    open = false;
    dispatch("change", { selected: option });
  }

  function focusOut({ relatedTarget, currentTarget }) {
    if (
      relatedTarget instanceof HTMLElement &&
      currentTarget.contains(relatedTarget)
    ) {
      return;
    }

    open = false;
  }

  function handleKeydown(event) {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }
</script>

<div class="menu-wrapper" bind:this={menuWrapper} on:focusout={focusOut}>
  <div class="menu-container">
    <input
      type="text"
      class="menu-input"
      value={selectedOption}
      title={tooltip}
      readonly
      {disabled}
    />
    <button class="menu-button" on:click={toggleMenu} {disabled} on:keydown={handleKeydown}>▼</button>
  </div>

  {#if open}
    <div class="menu-options">
      {#each options as option}
        <button on:click={() => selectOption(option)}>{option}</button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .menu-wrapper {
    position: relative;
    display: inline-block;
  }

  .menu-container {
    display: flex;
    align-items: center;
  }

  .menu-input {
    background-color: white;
    padding: 0 15px;
    border: 2px solid var(--tertiary);
    border-radius: 20px 0 0 20px;
    outline: none;
    width: 120px;
    height: 40px;
    cursor: default;
    line-height: 45px;
    font-size: 16px;
    color: var(--tertiary);
  }

  .menu-button {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    border: 2px solid var(--tertiary);
    border-radius: 0 20px 20px 0;
    margin-left: -2px;
    height: 40px;
    width: 40px;
    color: var(--tertiary);
    transition: 0.2s;
    cursor: pointer;
  }

  .menu-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    background-color: var(--background-secondary);
    width: 170px;
    border-radius: 8px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 5px 10px;
    overflow: hidden;
    z-index: 1000;
  }

  .menu-options button {
    background-color: transparent;
    outline: none;
    border: none;
    font-size: 16px;
    width: 100%;
    color: var(--on-background-secondary);
    padding: 14px 120px 14px 20px;
    text-align: left;
    transition: 0.2s;
    white-space: nowrap;
    cursor: pointer;
  }

  .menu-options button:hover {
    background-color: rgba(100, 100, 100, 0.15);
  }

  /* Disabled state styles */
  .menu-input[disabled] {
    background-color: #f0f0f0;
    color: #b0b0b0;
    border-color: #d0d0d0;
    cursor: not-allowed;
  }

  .menu-button[disabled] {
    background-color: #f0f0f0;
    color: #b0b0b0;
    border-color: #d0d0d0;
    cursor: not-allowed;
  }
</style>