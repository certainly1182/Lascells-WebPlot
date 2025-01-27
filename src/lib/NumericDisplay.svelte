<script>
  import {
    serialLineStore,
    productStore,
    transformVoltageData,
  } from "../js/store";
  import PanelMeter from "./PanelMeter.svelte";

  export let hidden = false;

  let latestValue = null;
  let currentProduct;
  let valueBuffer = [];
  let lastUpdateTime = Date.now();
  const UPDATE_INTERVAL = 500;  // ms

  productStore.subscribe((value) => {
    currentProduct = value;
  });

  function parseLine(line) {
    const lineSplit = line.split(",");
    const data = [];

    for (const num of lineSplit) {
      if (num === "") break;
      const numFloat = parseFloat(num);
      if (isNaN(numFloat)) {
        data.push(null);
        break;
      }
      data.push(numFloat);
    }
    return data;
  }

  function calculateAverage(values) {
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  function updateLatestValue(line) {
    if (line.length === 0 || line === "undefined") return;

    const transformedLine = transformVoltageData(line, currentProduct.scale);
    const data = parseLine(transformedLine);
    if (data.length >= 2) {
      const currentTime = Date.now();
      valueBuffer.push(data[1]);

      if (currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
        latestValue = calculateAverage(valueBuffer);
        valueBuffer = [];
        lastUpdateTime = currentTime;
      }
    }
  }

  // Subscribe to serial data updates
  $: $serialLineStore, updateLatestValue($serialLineStore);
</script>

{#if !hidden}
<div class="numeric-display">
  <PanelMeter
    value={latestValue !== null ? latestValue : 0}
    unit={currentProduct?.unit || "V"}
  />
</div>
{/if}

<style>
  .numeric-display {
    position: absolute;
    top: 4rem;
    bottom: 4rem;
    left: 0;
    width: 100%;
    height: calc(100vh - 8rem);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 20;
    background-color: white;
  }
</style>
