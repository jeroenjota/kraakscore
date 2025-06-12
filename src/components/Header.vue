<template>
  <nav class="navbar">
    <div class="container">
      <div class="logo">Kraken</div>

      <button class="menu-toggle" @click="toggleMenu">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </button>

      <ul :class="['nav-links', { open: isOpen }]">
        <li><a href="#">Home</a></li>
        <li><a href="#">Over</a></li>
        <li><a href="#">Diensten</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue'

const isOpen = ref(false)

function toggleMenu() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.navbar {
  background-color: green;
  color: white;
  padding: 0.5rem 1rem;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1rem;
}

.nav-links li a {
  color: white;
  text-decoration: none;
}

.menu-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  cursor: pointer;
}

.menu-toggle .bar {
  width: 25px;
  height: 3px;
  background-color: white;
}

/* Mobile */
@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 60px;
    right: 0;
    background-color: #333;
    flex-direction: column;
    width: 200px;
    padding: 1rem;
    display: none;
  }

  .nav-links.open {
    display: flex;
  }
}
</style>
