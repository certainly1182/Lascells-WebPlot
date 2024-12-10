<!-- lib/ChartControls.svelte -->

<script>
    import { createEventDispatcher } from 'svelte';
    
    const dispatch = createEventDispatcher();
  
    function handleAutoscale() {
      dispatch('autoscale');
    }
  </script>
  
  <div class="chart-controls">
    <button 
        class="autoscale-button"
        on:click={handleAutoscale}
    >
        Autoscale Y-Axis
    </button>
  </div>
  
  <style>
    .chart-controls {
      position: fixed;
      bottom: 60px;
      right: 10px;
      padding: 5px 10px;
      z-index: 10;
    }
  
    .autoscale-button {
        padding: 0px 10px;
        height: 30px;
        background-color: #26488b;
        color: white;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .autoscale-button:hover {
        background-color: #1e3a6d;
    }
  </style>