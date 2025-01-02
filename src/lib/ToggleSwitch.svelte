<script>
  export let checked = false;
  export let onChange = () => {};
  export let disabled = false;
  export let leftText = "Manual";
  export let rightText = "Periodic";
  export let width = "100px"; // Exported width

  // Calculate the knob's transform distance based on width
  let knobTransformChecked;
  let knobTransformUnchecked = "0px";

  // Update `knobTransformChecked` whenever `width` changes
  $: knobTransformChecked = `calc(${width} - 40px)`; // 32px (knob size) + 4px (padding)

  // Handle the change event
  const handleChange = () => {
    if (!disabled) {
      onChange(checked);
    }
  };
</script>

<div class="toggle-switch">
  <label>
    <input
      type="checkbox"
      title="Toggle Switch"
      bind:checked
      on:change={handleChange}
      {disabled}
    />
    <span
      class="slider"
      style="width: {width};"
    >
      <span
        class="knob"
        style="transform: translateX({checked ? knobTransformChecked : knobTransformUnchecked});"
      ></span>
      <span class="option left">{leftText}</span>
      <span class="option right">{rightText}</span>
    </span>
  </label>
</div>

<style>
  .toggle-switch {
    display: flex;
    align-items: center;
  }

  label {
    cursor: pointer;
    display: flex;
    align-items: center;
    position: relative;
  }

  input[type="checkbox"] {
    display: none;
  }

  .slider {
    position: relative;
    height: 40px; /* Fixed height */
    background-color: #aaa;
    border-radius: 40px;
    transition: background-color 0.3s;
  }

  .knob {
    position: absolute;
    left: 4px;
    top: 4px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: white;
    transition: transform 0.3s;
  }

  .option {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: bold;
    color: white;
    white-space: nowrap;
  }

  .left {
    right: 4px;
  }

  .right {
    left: 4px;
  }

  input:checked + .slider {
    background-color: var(--primary);
  }

  /* Hide text options when checked */
  input:checked + .slider .left {
    opacity: 0;
  }

  input:checked + .slider .right {
    opacity: 1;
  }

  /* Show text options when unchecked */
  input:not(:checked) + .slider .left {
    opacity: 1;
  }

  input:not(:checked) + .slider .right {
    opacity: 0;
  }

  input:disabled + .slider {
    background-color: #ccc; /* Light grey background */
    cursor: not-allowed; /* Indicate that it is not clickable */
  }

  input:disabled + .slider .knob {
    background-color: #999; /* Darker grey for the knob */
  }
</style>
