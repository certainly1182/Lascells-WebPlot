<script>
  import {
    serialLineStore,
    productStore,
    transformVoltageData,
  } from "../js/store";

  export let hidden = false;

  let latestValue = null;
  let currentProduct;

  // Galvanometer specific settings
  let minValue = -20;
  let maxValue = 20;
  let needleAngle = 0; // Starting angle (when value is at minimum)
  const angleRange = 120; // Total range of needle movement in degrees

  $: needleRotation = `${needleAngle}deg`;

  productStore.subscribe((value) => {
    currentProduct = value;
    // Update min/max based on product settings if available
    if (currentProduct && currentProduct.range) {
      minValue = currentProduct.range.min || -20;
      maxValue = currentProduct.range.max || 20;
    }
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
      latestValue = data[1];
      updateNeedleAngle();
    }
  }

  function updateNeedleAngle() {
    if (latestValue === null) return;

    // Clamp value to min/max range
    const clampedValue = Math.max(minValue, Math.min(maxValue, latestValue));

    // Calculate percentage of range
    const percentage = (clampedValue - minValue) / (maxValue - minValue);

    // Map percentage to angle range
    needleAngle = -60 + percentage * angleRange;
  }

  // Subscribe to serial data updates
  $: $serialLineStore, updateLatestValue($serialLineStore);
</script>

{#if !hidden}
  <div class="galvanometer-display">
    <div class="meter">
      <div class="scale">
        {#each Array(9) as _, i}
          <!-- Major ticks with labels -->
          <div
            class="tick major-tick"
            style="transform: rotate({-60 + i * 15}deg)"
          >
            <div class="tick-line"></div>
            <div class="tick-label">
              {Math.round(minValue + (i / 8) * (maxValue - minValue))}
            </div>
          </div>

          <!-- Minor ticks between major ticks -->
          {#if i < 8}
            {#each Array(4) as _, j}
              <div
                class="tick minor-tick"
                style="transform: rotate({-60 + i * 15 + (j + 1) * 3}deg)"
              >
                <div class="tick-line"></div>
              </div>
            {/each}
          {/if}
        {/each}
      </div>

      <div class="needle-container">
        <div
          class="needle"
          style="transform: translateX(-50%) rotate({needleAngle}deg)"
        ></div>
        <div class="needle-center"></div>
      </div>

      <div class="value-display">
        <span class="unit">{currentProduct?.unit || "V"}</span>
      </div>
    </div>
  </div>
{/if}

<style>
  .galvanometer-display {
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

  .meter {
    position: relative;
    width: 90vw;
    max-width: 1200px;
    height: 45vw;
    max-height: 600px;
    border-radius: 45vw 45vw 0 0;
    background-color: #f5f5f5;
    border: 2px solid #333;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .scale {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .tick {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    transform-origin: center bottom;
  }

  .tick-line {
    position: absolute;
    top: 1vw;
    left: 50%;
    width: 0.2vw;
    min-width: 2px;
    height: 3vw;
    background-color: black;
    transform: translateX(-50%);
  }

  .minor-tick .tick-line {
    height: 1.5vw;
    width: 0.1vw;
    min-width: 1px;
  }

  .tick-label {
    position: absolute;
    top: 4vw;
    left: 50%;
    transform: translateX(-50%);
    font-size: 2.5vw;
    min-font-size: 10px;
    color: #333;
  }

  .needle-container {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 100%;
  }

  .needle {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0.3vw;
    min-width: 3px;
    height: 43vw;
    max-height: 550px;
    background-color: red;
    transform-origin: bottom center;
    transform: translateX(-50%);
    transition: transform 0.3s ease-out;
    z-index: 10;
  }

  .needle-center {
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 3vw;
    height: 3vw;
    min-width: 10px;
    min-height: 10px;
    max-width: 40px;
    max-height: 40px;
    background-color: #333;
    border-radius: 50%;
    transform: translateX(-50%);
    z-index: 11;
  }

  .value-display {
    position: absolute;
    bottom: 10vw;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    font-size: 4vw;
    max-font-size: 48px;
    font-weight: bold;
    color: #333;
  }

  .unit {
    font-size: 4vw;
    max-font-size: 30px;
  }
</style>
