<!-- lib/ChartControls.svelte -->

<script>
    import { createEventDispatcher } from 'svelte';
  
    export let isYAxisAutoScale = true;
    
    const dispatch = createEventDispatcher();
  
    function handleAutoScaleToggle() {
      isYAxisAutoScale = !isYAxisAutoScale;
      dispatch('toggleAutoscale', isYAxisAutoScale);
    }
  </script>
  
  <div class="chart-controls">
    <label class="autoscale-toggle">
      <input 
        type="checkbox" 
        checked={isYAxisAutoScale}
        on:change={handleAutoScaleToggle}
      />
      Y-Axis Autoscale
    </label>
  </div>
  
  <style>
    .chart-controls {
      position: fixed;
      bottom: 60px;
      right: 10px;
      padding: 5px 10px;
      z-index: 10;
    }
  
    .autoscale-toggle {
      display: flex;
      align-items: center;
      gap: 5px;
    }
  </style>