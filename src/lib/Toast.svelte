<script>
    import { onMount } from 'svelte';
    import { toastStore } from "../js/store";
    import { fly } from 'svelte/transition';
    
    let toast = null;
    let timeoutId = null;
    
    toastStore.subscribe(value => {
      if (value) {
        if (timeoutId) clearTimeout(timeoutId);
        toast = value;
        timeoutId = setTimeout(() => {
          toast = null;
          toastStore.set(null);
        }, 5000);
      }
    });
  
    onMount(() => {
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
      };
    });
  </script>
  
  {#if toast}
    <div 
      class="toast"
      transition:fly={{ x: 300, duration: 300 }}
    >
      <div class="toast-content">
        <span class="toast-icon">⚠️</span>
        <span class="toast-message">{toast}</span>
      </div>
    </div>
  {/if}
  
  <style>
    .toast {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9000;
      background: #f44336;
      color: white;
      padding: 1rem;
      border-radius: 4px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      max-width: 400px;
    }
  
    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
  
    .toast-icon {
      font-size: 1.2em;
    }
  
    .toast-message {
      font-size: 0.9rem;
    }
  </style>