<!-- lib/YAxisTriangleControl.svelte -->
<script>
  import { createEventDispatcher } from "svelte";
  import { faForwardStep } from "@fortawesome/free-solid-svg-icons";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";

  export let value = null;
  export let type = "max"; // 'max' or 'min'
  export let valid = true;

  const dispatch = createEventDispatcher();

  $: displayValue =
    value !== null && !isNaN(value) ? parseFloat(value).toFixed(1) : "";

  function handleInput() {
    const newValue = parseFloat(event.target.value);
    if (isNaN(newValue)) {
      value = null;
    } else {
      value = newValue;
    }
    dispatch("valueChange", value);
  }

  function handleWheel(event) {
    event.preventDefault(); // Prevent default scroll behavior
    const step = 0.1; // Define the step size for scrolling
    value = parseFloat(value) || 0; // Ensure value is a number
    value += event.deltaY < 0 ? step : -step; // Increment or decrement value
    value = parseFloat(value.toFixed(1)); // Ensure one decimal place
    dispatch("valueChange", value); // Dispatch the updated value
  }

  function autoscaleYAxis() {
    dispatch("autoscaleYAxis");
  }
</script>

<div class="y-axis-triangle-control">
  <input
    type="number"
    value={displayValue}
    title={type === "max" ? "Max" : "Min"}
    on:input={handleInput}
    on:wheel={handleWheel}
    placeholder={type === "max" ? "Max" : "Min"}
    class="y-axis-input {valid ? '' : 'invalid'}"
  />
  <FontAwesomeIcon
    icon={faForwardStep}
    title="Autoscale Y-Axis"
    on:click={autoscaleYAxis}
    style="transform: rotate({type === 'max' ? 270 : 90}deg);"
  />
</div>

<style>
  .y-axis-triangle-control {
    display: flex;
    align-items: center; /* Align input and arrow vertically */
    justify-content: flex-start; /* Align input and arrow horizontally */
    gap: 0.25rem;
    width: fit-content; /* Ensure the container wraps tightly around the content */
    text-align: center;
  }

  /* Font Awesome icon styles */
  .y-axis-triangle-control :global(svg) {
    font-size: 2rem; /* Adjust icon size */
    color: #26488b; /* Icon color */
    cursor: pointer;
  }

  /* Input box styles */
  .y-axis-input {
    width: 3rem;
    background: white;
    border: 1px solid #26488b;
    border-radius: 4px;
    outline: none;
  }

  .y-axis-input:focus {
    outline: none; /* Remove browser's default focus outline */
    border: 2px solid #26488b; /* Add your own focus styling */
  }

  .y-axis-input.invalid {
    border: 2px solid red; /* Ensure the red border is prominent */
  }
</style>
