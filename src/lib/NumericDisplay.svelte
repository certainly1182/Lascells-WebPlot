<script>
  import {
    serialLineStore,
    productStore,
    transformVoltageData,
  } from "../js/store";
  import PanelMeter from "./PanelMeter.svelte";

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

<div class="numeric-display">
  <PanelMeter
    value={latestValue !== null ? latestValue : 0}
    unit={currentProduct?.unit || "V"}
  />
</div>

<style>
  .numeric-display {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 8rem);
    width: 100%;
  }
</style>
