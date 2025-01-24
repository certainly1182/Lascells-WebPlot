<script>
  export let value = 0;
  export let unit = "";

  $: formattedValue = formatValue(value);

  function formatValue(val) {
    const num = parseFloat(val);
    if (isNaN(num)) return '0000';
    
    // Convert to string with up to 3 decimal places
    let str = num.toFixed(3);
    
    // Trim excess digits while keeping decimal point position
    if (str.length > 5) { // 5 includes decimal point
      str = str.slice(0, 5); // Keep first 4 digits + decimal
    }
    
    return str;
  }
</script>

<section class="panel">
  <div class="digits-container">
    <div class="digits">
      {#each formattedValue.split("") as digit}
        <span class="digit" class:point={digit === '.'}>{digit}</span>
      {/each}
    </div>
    <span class="unit">{unit}</span>
  </div>
</section>

<style>
  @font-face {
    font-family: 'DSEG7Modern-Bold';
    src: url('/fonts/dseg/DSEG7Modern-Bold.woff') format('woff');
  }

  .panel {
    position: absolute;
    z-index: 900;
    user-select: none;
    display: flex;
    justify-content: center; /* Center content horizontally */
    align-items: center; /* Center content vertically */
    padding: 0 1rem;
    border-radius: 0.5rem;
    white-space: nowrap;
  }

  .digits-container {
    display: flex;
    flex-direction: column; /* Stack digits and unit vertically */
    align-items: center; /* Center items horizontally */
  }

  .digits {
    font-family: 'DSEG7Modern-Bold', sans-serif;
    font-size: 20vw;
    color: black;
    text-align: center;
  }

  .digit {
    display: inline-block;
    text-align: center;
  }

  .unit {
    color: black;
    font-size: 8vh;
    text-align: center;
    width: 100%; /* Ensure it spans the entire container */
  }
</style>
