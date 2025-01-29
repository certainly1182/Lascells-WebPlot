<!-- lib/Chart.svelte -->

<script>
  import { onMount } from "svelte";
  import {
    serialLineStore,
    fullDataStore,
    productStore,
    transformVoltageData,
    showToast,
  } from "../js/store";
  import uPlot from "uplot";
  import "uplot/dist/uPlot.min.css";
  import ChartControls from "./ChartControls.svelte";
  import { createSineWaveData } from "../js/utils";
  import YAxisTriangleControl from "./YAxisTriangleControl.svelte";

  let chart;
  let currentProduct;
  productStore.subscribe((value) => {
    currentProduct = value;
    if (chart) {
      chart.axes[1].label = `${currentProduct.unit}`;
      chart.redraw();
      resetView();
    }
  });
  export let isPeriodicSampling;
  let xAxisLabel;
  $: {
    xAxisLabel = isPeriodicSampling ? "Time (s)" : "Index";
  }
  $: if (chart) {
    chart.axes[0].label = xAxisLabel;
    chart.redraw();
  }

  export let voltageString;

  export let numPoints;
  const maxLines = 30;

  const chartData = Array.from({ length: maxLines + 1 }, () => []);

  let chartContainer;
  let manualYScale = { min: null, max: null };

  export function clearChartData() {
    serialLineStore.set("");
    fullDataStore.set([]);

    chartData.forEach((line, index) => {
      chartData[index] = [];
    });

    chart.setData(chartData);
  }

  function addChartData(data) {
    for (let i = 0; i < data.length; i++) {
      chartData[i].push(data[i]);

      if (chartData[i].length > numPoints) {
        chartData[i] = chartData[i].slice(-numPoints);
      }
    }
  }

  function parseLine(line) {
    const lineSplit = line.split(",");

    const data = [];

    for (const num of lineSplit) {
      if (num === "") {
        break;
      }

      const numFloat = parseFloat(num);
      if (isNaN(numFloat)) {
        data.push(null);
        break;
      }

      data.push(numFloat);
    }

    return data;
  }

  function updateChart() {
    const line = $serialLineStore;

    if (line.length === 0 || line === "undefined") {
      return;
    }

    const transformedLine = transformVoltageData(line, currentProduct.scale);
    const data = parseLine(transformedLine);
    addChartData(data);

    chart.setData(chartData);

    chart.batch(() => {
      chart.setScale("y", {
        min: manualYScale.min,
        max: manualYScale.max,
      });
    });
  }

  $: $serialLineStore, updateChart();

  function createChart() {
    const seriesOpts = [{}];

    for (let i = 0; i < maxLines; i++) {
      const color = "#26488b";

      seriesOpts.push({
        label: `Line ${i + 1}`,
        stroke: color,
        fill: `${color}1A`,
      });
    }

    const opts = {
      pxAlign: false,
      scales: {
        x: {
          time: false,
        },
        y: {
          auto: false,
          range: [-6, 6],
        },
      },
      axes: [
        {
          scale: "x",
          show: true,
          label: xAxisLabel,
          width: 1,
          stroke: "#000",
          ticks: {
            width: 0.2,
            stroke: "#000",
          },
          grid: {
            width: 0.2,
            stroke: "#000",
          },
        },
        {
          label: currentProduct?.unit || "Voltage (V)",
          stroke: "#000",
          ticks: {
            width: 0.2,
            stroke: "#000",
          },
          grid: {
            width: 0.2,
            stroke: "#000",
          },
        },
      ],
      legend: {
        show: false,
      },
      cursor: {
        show: false,
      },
      select: {
        show: false,
      },
      font: {
        color: "#000",
      },
      series: seriesOpts,
      hooks: {
        init: [zoomWheelPlugin],
      },
    };

    const numInitialPoints = numPoints || 100;
    const initialSineData = createSineWaveData(numInitialPoints);
    chartData[0] = initialSineData[0];
    chartData[1] = initialSineData[1];

    return new uPlot(opts, chartData, chartContainer);
  }

  function autoscaleYAxis() {
    if (chart) {
      const yMin = Math.min(...chartData[1]) - 0.1;
      const yMax = Math.max(...chartData[1]) + 0.1;
      chart.batch(() => {
        // Reset y-axis to initial range or autoscale
        chart.setScale("y", {
          min: yMin,
          max: yMax,
        });
      });

      // Reset manual Y scale to initial values
      manualYScale = { min: yMin, max: yMax };
    }
  }

  function updateYScaleFromInput() {
    if (manualYScale.min !== null && manualYScale.max !== null) {
      chart.batch(() => {
        chart.setScale("y", {
          min: manualYScale.min,
          max: manualYScale.max,
        });
      });
    }
  }

  function zoomWheelPlugin(u) {
    let factor = 0.9;
    let over = u.over;
    let rect = over.getBoundingClientRect();

    let isDragging = false;
    let lastPosX = null;
    let lastPosY = null;

    function clamp(nRange, nMin, nMax, fRange, fMin, fMax) {
      if (nRange > fRange) {
        nMin = fMin;
        nMax = fMax;
      } else if (nMin < fMin) {
        nMin = fMin;
        nMax = fMin + nRange;
      } else if (nMax > fMax) {
        nMax = fMax;
        nMin = fMax - nRange;
      }
      return [nMin, nMax];
    }

    function zoom(e) {
      e.preventDefault();

      const { width } = rect;
      const xVal = u.posToVal(e.offsetX, "x");
      const xRange = u.scales.x.max - u.scales.x.min;

      const zoomFactor = e.deltaY < 0 ? factor : 1 / factor;
      const newMin = xVal - (xVal - u.scales.x.min) * zoomFactor;
      const newMax = xVal + (u.scales.x.max - xVal) * zoomFactor;

      if (newMax - newMin > 0.1) {
        u.batch(() => {
          u.setScale("x", { min: newMin, max: newMax });
        });
      }
    }

    function startPan(e) {
      isDragging = true;
      lastPosX = e.clientX;
      lastPosY = e.clientY;
      rect = over.getBoundingClientRect();
    }

    function doPan(e) {
      if (!isDragging) return;

      const dx = e.clientX - lastPosX;
      const dy = e.clientY - lastPosY;

      const xScale = u.scales.x;
      const yScale = u.scales.y;

      const xRange = xScale.max - xScale.min;
      const yRange = yScale.max - yScale.min;

      const nxMin = xScale.min - dx * (xRange / rect.width);
      const nxMax = xScale.max - dx * (xRange / rect.width);

      const nyMin = yScale.min + dy * (yRange / rect.height);
      const nyMax = yScale.max + dy * (yRange / rect.height);

      u.batch(() => {
        u.setScale("x", { min: nxMin, max: nxMax });

        u.setScale("y", { min: nyMin, max: nyMax });

        manualYScale = { min: nyMin, max: nyMax };
      });

      lastPosX = e.clientX;
      lastPosY = e.clientY;
    }

    function endPan() {
      isDragging = false;
      lastPosX = null;
      lastPosY = null;
    }

    over.addEventListener("wheel", zoom);
    over.addEventListener("mousedown", startPan);
    window.addEventListener("mousemove", doPan);
    window.addEventListener("mouseup", endPan);
  }

  function getSize() {
    const remInPixels = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    return {
      width: window.innerWidth,
      height: window.innerHeight - 9 * remInPixels,
    };
  }

  let isMaxValid = true;
  let isMinValid = true;

  function handleMaxChange(event) {
    const newMax = event.detail;

    // Ensure max is greater than min
    if (manualYScale.min !== null && newMax <= manualYScale.min) {
      manualYScale.max = manualYScale.min + 0.1; // Set a minimum gap
      isMaxValid = false;
      showToast("Y-Axis Max < Min");
    } else {
      manualYScale.max = newMax;
      isMaxValid = true;
    }
    updateYScale();
  }

  function handleMinChange(event) {
    const newMin = event.detail;

    // Ensure min is less than max
    if (manualYScale.max !== null && newMin >= manualYScale.max) {
      manualYScale.min = manualYScale.max - 0.1; // Set a minimum gap
      isMinValid = false;
      showToast("Y-Axis Min > Max");
    } else {
      manualYScale.min = newMin;
      isMinValid = true;
    }

    updateYScale();
  }

  function updateYScale() {
    if (chart && manualYScale.min !== null && manualYScale.max !== null) {
      chart.batch(() => {
        chart.setScale("y", {
          min: manualYScale.min,
          max: manualYScale.max,
        });
      });
    }
  }

  export function resetView() {
    if (chart) {
      let yMin, yMax;

      if (!currentProduct?.name) {
        // No product selected - use voltage range from header
        if (voltageString === "-1 to +1V") {
          yMin = -1;
          yMax = 1;
        } else if (voltageString === "-5 to +5V") {
          yMin = -5;
          yMax = 5;
        } else if (voltageString === "-50 to +50V") {
          yMin = -50;
          yMax = 50;
        }
      } else {
        // Product selected - use product's voltage range
        yMin = currentProduct.yRange.min;
        yMax = currentProduct.yRange.max;
      }

      // Reset x-axis scale to full range
      chart.batch(() => {
        chart.setScale("x", {
          min: Math.min(...chartData[0]),
          max: chartData[0].length - 1,
        });

        // Set y-axis to determined range
        chart.setScale("y", {
          min: yMin,
          max: yMax,
        });
      });

      // Update manual Y scale
      manualYScale = { min: yMin, max: yMax };
    }
  }

  onMount(() => {
    chart = createChart();
    window.addEventListener("resize", () => {
      chart.setSize(getSize());
    });
    chart.setSize(getSize());
    chart.setData(chartData);
    if (chart) {
      // Perform one-time autoscale
      chart.batch(() => {
        chart.setScale("y", { auto: true });
      });
      manualYScale = {
        min: chart.scales.y.min,
        max: chart.scales.y.max,
      };
    }
  });
</script>

<div id="chart-container">
  <div bind:this={chartContainer}>
    <div style="position: fixed; top: 4rem; left: 1px; z-index: 15;">
      <YAxisTriangleControl
        type="max"
        bind:value={manualYScale.max}
        on:valueChange={handleMaxChange}
        valid={isMaxValid}
        on:autoscaleYAxis={autoscaleYAxis}
      />
    </div>
    <ChartControls on:reset_view={resetView} />
    <div style="position: fixed; bottom: 5rem; left: 1px; z-index: 15;">
      <YAxisTriangleControl
        type="min"
        bind:value={manualYScale.min}
        on:valueChange={handleMinChange}
        valid={isMinValid}
        on:autoscaleYAxis={autoscaleYAxis}
      />
    </div>
  </div>
</div>

<style>
  #chart-container {
    position: relative;
    width: 100%;
    height: calc(100vh - 8rem);
    padding-top: 1rem;
  }
</style>
