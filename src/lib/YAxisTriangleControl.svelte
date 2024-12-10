<!-- lib/YAxisTriangleControl.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { faForwardStep } from '@fortawesome/free-solid-svg-icons';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

  export let value = null;
  export let type = 'max'; // 'max' or 'min'

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('valueChange', value);
  }
</script>
  
<div class="y-axis-triangle-control">
  <FontAwesomeIcon 
    icon={faForwardStep}
    style="transform: rotate({type === 'max' ? 90 : 270}deg);"
  />
  <input 
    type="number" 
    bind:value 
    on:input={handleInput} 
    placeholder={type === 'max' ? 'Max' : 'Min'}
    class={type === 'max' ? 'max-position' : 'min-position'}
  />
</div>
  
<style>
  .y-axis-triangle-control {
    position: absolute;
    width: 3rem;
    z-index: 15;
    text-align: center;
  }

  /* Font Awesome icon styles */
  .y-axis-triangle-control :global(svg) {
    font-size: 2rem; /* Adjust icon size */
    color: #26488b; /* Icon color */
    display: block;
    margin: auto;
    cursor: pointer;
  }

  /* Input box positioning for max and min */
  .max-position, .min-position {
    position: absolute;
    left: 50%; /* Center horizontally */
    transform: translateX(-50%); /* Offset by half the width */
    width: 4rem;
    z-index: 20;
    background: white;
    border: 1px solid #26488b;
    border-radius: 4px;
    padding: 2px;
  }

  .max-position {
    top: 5%; /* Max input position */
  }

  .min-position {
    top: 85%; /* Min input position */
  }
</style>