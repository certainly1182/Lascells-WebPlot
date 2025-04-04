<!-- lib/ChartControls.svelte -->

<script>
  import { createEventDispatcher } from "svelte";
  import { exportFullDataToCSV } from "../js/serial";

  const dispatch = createEventDispatcher();

  function handleExport() {
    exportFullDataToCSV();
  }

  function handleClear() {
    dispatch("clear_view");
  }

  function handleReset() {
    dispatch("reset_view");
  }
</script>

<div class="chart-controls">
  <button class="export-button" on:click={handleReset}> Reset View </button>
  <!-- <button class="export-button" on:click={handleReset}> Clear Data </button> -->
  <button class="export-button" on:click={handleExport}> Export to CSV </button>
</div>

<style>
  .chart-controls {
    position: fixed;
    bottom: 3.7rem;
    right: 0rem;
    padding: 0.5rem;
    z-index: 10;
  }

  .export-button {
    padding: 0.5rem;
    height: 2rem;
    background-color: #26488b;
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .export-button:hover {
    background-color: #1e3a6d;
  }
</style>
