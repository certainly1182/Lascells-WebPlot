<script>
  export let name;
  export let icon;
  export let title;
  export let disabled = false;

  function handleKeydown(event) {
    if (event.code === 'Space') {
      event.preventDefault();
    }
  }
</script>

<button
  on:click
  title={title}
  on:keydown={handleKeydown}
  {disabled}
  class:disabled={disabled}
>
  {name}
  <i class="fa fa-{icon}"></i>
</button>

<style>
  button {
    border: none;
    background-color: var(--background-color);
    color: var(--color);
    padding: 9px 25px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    border-radius: 40px;
    font-size: 16px;
    font-weight: 600;
    transition: 0.3s;
    height: 40px;
  }

  button:hover {
    background-color: #1e3a6d;
  }

  button.disabled {
    background-color: #ccc; /* Disabled background color */
    color: #777; /* Disabled text color */
    cursor: not-allowed; /* Show the "not-allowed" cursor */
  }

  button:disabled {
    background-color: #ccc; /* Apply disabled styles directly */
    color: #777;
    cursor: not-allowed;
  }
</style>
