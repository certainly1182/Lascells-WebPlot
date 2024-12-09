<script>
    export let checked = false;
    export let onChange = () => {};
  
    // Handle the change event
    const handleChange = () => {
      onChange(checked);
    };
</script>
  
<div class="toggle-switch">
    <label>
        <input type="checkbox" title="Sampling Method" bind:checked on:change={handleChange} />
        <span class="slider">
        <span class="option left">Manual</span>
        <span class="option right">Periodic</span>
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
        width: 100px;
        height: 40px;
        background-color: #ccc;
        border-radius: 40px;
        transition: background-color 0.3s;
    }

    .slider:before {
        content: "";
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
    }

    .left {
        left: 40px;
    }

    .right {
        right: 40px;
    }

    input:checked + .slider {
        background-color: var(--primary);
    }

    input:checked + .slider:before {
        transform: translateX(60px);
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
</style>
  