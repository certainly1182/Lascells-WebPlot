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

  function updateLatestValue(line) {
    if (line.length === 0 || line === "undefined") return;

    const transformedLine = transformVoltageData(line, currentProduct.scale);
    const data = parseLine(transformedLine);
    if (data.length >= 2) {
      // Assuming first value is time/index and second is measurement
      latestValue = data[1];
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
