<script>
  export let value = 0;
  export let unit = "";
  export let left = 100;
  export let top  = 100;
  let moving = false;

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

  function onMouseDown() {
    moving = true;
  }

  function onMouseMove(e) {
    if (moving) {
        left += e.movementX;
        top += e.movementY;
    }
  }

  function onMouseUp() {
		moving = false;
	}
</script>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<section
    on:mousedown={onMouseDown}
    style="left: {left}px; top: {top}px;"
    class="panel"
>
  <div class="digits">
    {#each formattedValue.split("") as digit}
        <span class="digit" class:point={digit === '.'}>{digit}</span>
    {/each}
  </div>
  <span class="unit">{unit}</span>
</section>

<style>
  .panel {
    position: absolute;
    z-index: 9999;
    user-select: none;
    cursor: move;
    display: flex;
    align-items: center;
    background: #1a1a1a;
    padding: 0 1rem 0 1rem;
    border-radius: 0.5rem;
    border: 4px solid #777777;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  }

  .digits {
    font-family: 'Seven Segment', sans-serif;                            
    font-size: 4rem;
    color: #00ffff;
  }

  .digit {
    display: inline-block;
    width: 2rem;
    text-align: center;
  }

  .point {
    width: 0.8rem;
  }

  .unit {
    margin-left: 0.5rem;
    color: #00ffff;
    font-size: 1.25rem;
  }
</style>
