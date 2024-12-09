<!-- lib/Chart.svelte -->

<script>
  import { onMount } from 'svelte';
  import { serialLineStore } from '../js/store';
  import uPlot from 'uplot';
  import ChartControls from './ChartControls.svelte';

  let chart;

  export let numPoints;
  const maxLines = 30;

  const chartData = Array.from({ length: maxLines + 1 }, () => []);

  let chartContainer;
  let isYAxisAutoScale = true;
  let manualYScale = { min: null, max: null };
  
  function addChartData(data) {
    for (let i = 0; i < data.length; i++) {
      chartData[i].push(data[i]);

      if (chartData[i].length > numPoints) {
        chartData[i] = chartData[i].slice(-numPoints);
      }
    }
  }

  function parseLine(line) {
    const lineSplit = line.split(',');

    const data = [];

    for (const num of lineSplit) {
      if (num === '') {
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

    if (line.length === 0 || line === 'undefined') {
      return;
    }

    const data = parseLine(line);
    addChartData(data);

    chart.setData(chartData);

    // If autoscale is off, maintain manual scale
    if (!isYAxisAutoScale && chart) {
      chart.batch(() => {
        chart.setScale('y', { 
          min: manualYScale.min, 
          max: manualYScale.max 
        });
      });
    }
  }

  $: $serialLineStore, updateChart();

  function createChart() {
    const seriesOpts = [{}];

    for (let i = 0; i < maxLines; i++) {
      const color = "#26488b";

      seriesOpts.push({
        label: `Line ${i+1}`,
        stroke: color,
        fill: `${color}1A`,
      });
    }

    const opts = {
      pxAlign: false,
      scales: {
        x: {
          time: true,
        },
        y: {
          auto: isYAxisAutoScale,
        },
      },
      axes: [
        {
          scale: 'x',
          show: true,
          label: "Time",
          width: 1,
          space: 300,
          stroke: '#000',
          ticks: {
            width: 0.2,
            stroke: '#000',
          },
          grid: {
            width: 0.2,
            stroke: '#000',
          },
        },
        {
          label: "Voltage (V)",
          stroke: '#000',
          ticks: {
            width: 0.2,
            stroke: '#000',
          },
          grid: {
            width: 0.2,
            stroke: '#000',
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
        color: '#000',
      },
      series: seriesOpts,
      hooks: {
        init: [zoomWheelPlugin],
      },
    };

    return new uPlot(opts, chartData, chartContainer);
  }

  function toggleYAxisAutoScale(event) {
    isYAxisAutoScale = event.detail;
    
    if (chart) {
      if (isYAxisAutoScale) {
        // Reset to autoscale
        chart.batch(() => {
          chart.setScale('y', { auto: true });
        });
      } else {
        // Capture current scale when turning off autoscale
        manualYScale = {
          min: chart.scales.y.min,
          max: chart.scales.y.max
        };
        
        chart.batch(() => {
          chart.setScale('y', { 
            min: manualYScale.min, 
            max: manualYScale.max 
          });
        });
      }
    }
  }

  function updateYScaleFromInput() {
    if (manualYScale.min !== null && manualYScale.max !== null) {
      chart.batch(() => {
        chart.setScale('y', {
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
      const xVal = u.posToVal(e.offsetX, 'x');
      const xRange = u.scales.x.max - u.scales.x.min;

      const zoomFactor = e.deltaY < 0 ? factor : 1 / factor;
      const newMin = xVal - (xVal - u.scales.x.min) * zoomFactor;
      const newMax = xVal + (u.scales.x.max - xVal) * zoomFactor;

      if (newMax - newMin > 0.1) {
        u.batch(() => {
          u.setScale('x', { min: newMin, max: newMax });
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
        u.setScale('x', { min: nxMin, max: nxMax });
        
        // Only update y-scale if autoscale is off
        if (!isYAxisAutoScale) {
          u.setScale('y', { min: nyMin, max: nyMax });
          
          // Store manual scale for persistence
          manualYScale = { min: nyMin, max: nyMax };
        }
      });

      lastPosX = e.clientX;
      lastPosY = e.clientY;
    }

    function endPan() {
      isDragging = false;
      lastPosX = null;
      lastPosY = null;
    }

    over.addEventListener('wheel', zoom);
    over.addEventListener('mousedown', startPan);
    window.addEventListener('mousemove', doPan);
    window.addEventListener('mouseup', endPan);
  }

  function getSize() {
    return {
      width: window.innerWidth - 20,
      height: window.innerHeight - 70,
    };
  }

  onMount(() => {
    chart = createChart();

    window.addEventListener('resize', () => {
      chart.setSize(getSize());
    });

    chart.setSize(getSize());
  });
</script>

<div id="chart-container" bind:this={chartContainer} />
<ChartControls 
  bind:isYAxisAutoScale
  on:toggleAutoscale={toggleYAxisAutoScale}
/>

<div class="y-axis-input-top">
  <input type="number" alt="Maximum Y-Value" bind:value={manualYScale.max} on:input={updateYScaleFromInput} />
</div>

<div class="y-axis-input-bottom">
  <input type="number" alt="Minimum Y-Value" bind:value={manualYScale.min} on:input={updateYScaleFromInput} />
</div>

<style>
  @import "../../node_modules/uplot/dist/uPlot.min.css";

  #chart-container {
    position: fixed;
    z-index: -1;
    height: (calc 100%- 60px - 60px);
    bottom: 52px;
  }

  .y-axis-input-top {
    position: absolute;
    top: 60px;
    left: 3px;
    z-index: 15;
    display: flex;
    flex-direction: column;
  }

  .y-axis-input-bottom {
    position: absolute;
    align-items: center;
    bottom: 120px;
    left: 3px;
    z-index: 15;
    display: flex;
    flex-direction: column;
  }

  .y-axis-input-top input,.y-axis-input-bottom input {
    width: 58px;
  }
</style>
