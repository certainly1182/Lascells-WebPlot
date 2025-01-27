<script>
  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();
  import { productStore } from "../js/store";

  import ToggleSwitch from "./ToggleSwitch.svelte";

  // Props
  export let isOpen = false;

  // Product data
  const products = [
    {
      name: "Hall Effect Probe",
      sku: "LA10-550B",
      image: "/Lascells-WebPlot/product_icons/LA10-550_hall_effect_probe.webp",
      imageAlt: "Hall Effect Probe",
      unit: "Millitesla (mT)",
      scale: 32,
      detailsUrl: "https://lascells.com/product/hall-effect-probe/",
    },
    {
      name: "E-Field Detector",
      sku: "LA10-990",
      image: "/Lascells-WebPlot/product_icons/LA10-990-E-Field-Detector.webp",
      imageAlt: "E-Field Detector",
      unit: "Picocoulombs (pC)",
      scale: 100,
      detailsUrl: "https://lascells.com/product/e-field-detector/",
      hasSettings: true,
      settings: {
        highSensitivity: true,
        scales: {
          high: 100, // 60mV = 6pC (ratio of 100)
          low: 10000, // 60mV = 600pC (ratio of 10000)
        },
      },
    },
    {
      name: "Boyles Law Digital Apparatus",
      sku: "LA30-217",
      image: "/Lascells-WebPlot/product_icons/LA30-217_Boyles_law.webp",
      imageAlt: "Boyles Law Digital Apparatus",
      unit: "Kilopascal (kPa)",
      scale: 100,
      detailsUrl: "https://lascells.com/product/boyles-law-digital-apparatus/",
    },
    {
      name: "Digital Jolly Bulb",
      sku: "LA30-216",
      image: "/Lascells-WebPlot/product_icons/LA30-216_digital_joly.webp",
      imageAlt: "Digital Jolly Bulb",
      unit: "Kilopascal (kPa)",
      scale: 100,
      detailsUrl: "https://lascells.com/product/digital-jolly-bulb/",
    },
    {
      name: "Malus' Law",
      sku: "LA20-875",
      image: "/Lascells-WebPlot/product_icons/LA20-875_Maluss_law.webp",
      imageAlt: "Malus' Law",
      unit: "Relative Intensity",
      scale: 1,
      detailsUrl: "https://lascells.com/product/malus-law/",
    },
  ];

  let selectedProduct = null;

  function closeModal() {
    dispatch("close");
  }

  function clearSelection() {
    selectedProduct = null;
    productStore.set({ name: null, scale: 1, unit: 'Volts (V)' });
    dispatch("clearSelection");
  }

  function selectProduct(product) {
    selectedProduct = product;

    productStore.set({
      name: product.name,
      scale: product.hasSettings 
        ? product.settings.scales[product.settings.highSensitivity ? "high" : "low"]
        : product.scale,
      unit: product.unit
    });

    dispatch("selectProduct", {
      product: {
        ...product,
        scale: product.hasSettings
          ? product.settings.scales[
              product.settings.highSensitivity ? "high" : "low"
            ]
          : product.scale,
      },
    });
  }

  function handleSensitivityChange(product, event) {
    if (product.hasSettings) {
      product.settings.highSensitivity = event.target.checked;
      if (selectedProduct === product) {
        selectProduct(product); // Re-emit with new scale
      }
    }
  }
</script>

{#if isOpen}
  <div class="modal" on:click|self={closeModal}>
    <div class="modal-content">
      <button class="close-button" on:click={closeModal}>&times;</button>
      <h2>Select a Product</h2>

      <div class="product-grid">
        {#each products as product}
          <div
            class="product-tile"
            class:selected={selectedProduct === product}
            on:click={() => selectProduct(product)}
            data-unit={product.unit}
            data-scale={product.hasSettings
              ? product.settings.scales[
                  product.settings.highSensitivity ? "high" : "low"
                ]
              : product.scale}
          >
            <img src={product.image} alt={product.imageAlt} />
            <h3>{product.name}</h3>
            <p>SKU: {product.sku}</p>
            {#if product.hasSettings}
              <div class="sensitivity-setting">
                <span class="sensitivity-label">Sensitivity:</span>
                <ToggleSwitch
                  checked={product.settings.highSensitivity}
                  onChange={(e) => handleSensitivityChange(product, e)}
                  disabled={false}
                  leftText="Low"
                  rightText="High"
                  width="75px"
                />
              </div>
            {/if}
            <a
              href={product.detailsUrl}
              target="_blank"
              on:click|stopPropagation
            >
              View Details
            </a>
          </div>
        {/each}
      </div>

      <button
        class="clear-selection-btn"
        on:click={clearSelection}
        disabled={!selectedProduct}
      >
        Clear Selection
      </button>
    </div>
  </div>
{/if}

<style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 90vw;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    border: none;
    background: none;
    cursor: pointer;
  }

  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(15vw, 1fr));
    gap: 1rem;
    margin: 2rem 0;
  }

  .product-tile {
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 1rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .product-tile:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .product-tile.selected {
    border-color: #007bff;
    background-color: #f8f9fa;
  }

  .product-tile img {
    max-width: 100%;
    height: auto;
    margin-bottom: 1rem;
  }

  .product-tile h3 {
    margin: 0.5rem 0;
    font-size: 1.1rem;
  }

  .product-tile p {
    color: #666;
    margin: 0.5rem 0;
  }

  .product-tile a {
    display: inline-block;
    color: #007bff;
    text-decoration: none;
    margin-top: 0.5rem;
  }

  .product-tile a:hover {
    text-decoration: underline;
  }

  .clear-selection-btn {
    display: block;
    margin: 1rem auto;
    padding: 0.5rem 1rem;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .clear-selection-btn:disabled {
    background-color: #dc354580;
    cursor: not-allowed;
  }

  .clear-selection-btn:not(:disabled):hover {
    background-color: #c82333;
  }

  .sensitivity-setting {
    margin: 0.5rem 0;
    font-size: 0.9rem;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .sensitivity-label {
    color: #666;
    font-size: 0.9rem;
  }

  .scale-info {
    display: block;
    color: #666;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }
</style>
