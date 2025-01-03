<script>
  let year = new Date().getFullYear();
</script>

<footer>
  <div class="footer-container">
    <!-- Left Side: Copyright -->
    <div class="footer-left">
      <p>&copy; {year} Lascells Ltd. All Rights Reserved.</p>
    </div>

    <!-- Right Side: Social Media Icons -->
    <div class="footer-right">
      <a href="https://x.com/lascells" target="_blank" aria-label="Twitter">
        <i class="fab fa-twitter"></i>
      </a>
      <a
        href="https://www.facebook.com/Lascells/"
        target="_blank"
        aria-label="Facebook"
      >
        <i class="fab fa-facebook"></i>
      </a>
      <a
        href="https://www.youtube.com/@LascellsScience"
        target="_blank"
        aria-label="YouTube"
      >
        <i class="fab fa-youtube"></i>
      </a>
      <a
        href="https://www.instagram.com/lascellsscience/"
        target="_blank"
        aria-label="Instagram"
      >
        <i class="fab fa-instagram"></i>
      </a>
    </div>
  </div>
</footer>

<style>
  footer {
    height: 4rem; /* Fixed footer height */
    padding: 1rem;
    background-color: #333;
    color: #777;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .footer-left p {
    margin: 0;
    font-size: 0.9rem;
  }

  .footer-right {
    display: flex;
    gap: 1rem;
  }

  .footer-right a {
    display: inline-block;
    color: #777;
  }

  .footer-right a:hover {
    transform: scale(1.2); /* Slightly enlarge icon on hover */
  }

  .footer-right i {
    width: 24px;
    height: 24px;
  }
</style>
