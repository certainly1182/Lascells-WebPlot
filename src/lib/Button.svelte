<script>
  export let name;
  export let icon;
  export let title;

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
</style>
