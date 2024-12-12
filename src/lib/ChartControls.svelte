<!-- lib/ChartControls.svelte -->

<script>
  import { createEventDispatcher } from "svelte";
  import { exportFullDataToCSV } from "../js/serial";

  const dispatch = createEventDispatcher();

  function handleAutoscale() {
    dispatch("autoscale");
  }

  function handleExport() {
    exportFullDataToCSV();
  }
</script>

<div class="chart-controls">
  <button class="export-button" on:click={handleExport}> Export to CSV </button>
  <button class="autoscale-button" on:click={handleAutoscale}>
    Autoscale Y-Axis
  </button>
</div>

<style>
  .chart-controls {
    position: fixed;
    bottom: 4rem;
    right: 0.5rem;
    padding: 0.5rem;
    z-index: 10;
  }

  .autoscale-button {
    padding: 0.5rem;
    height: 2rem;
    background-color: #26488b;
    color: white;
    border: none;
    border-radius: 2rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .autoscale-button:hover {
    background-color: #1e3a6d;
  }
</style>
