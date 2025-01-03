<script>
  export let selectedProductName = "";
  export let disabled = false;
  export let started = false;

  // Combine disabled prop with started state
  $: isDisabled = disabled || started;
</script>

<button
  on:click
  class="product-dropdown"
  aria-haspopup="true"
  disabled={isDisabled}
>
  <span class="product-name">{selectedProductName}</span>
  <span class="dropdown-arrow">▼</span>
</button>

<style>
  .product-dropdown {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 120px;
    height: 40px;
    padding: 0 15px;
    background-color: white;
    color: black;
    border: 2px solid var(--tertiary);
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
    min-width: 180px;
    justify-content: space-between;
    transition:
      background-color 0.2s,
      opacity 0.2s;
  }

  .product-dropdown:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #f5f5f5;
  }

  .product-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 150px;
  }

  .dropdown-arrow {
    font-size: 0.8rem;
  }
</style>
