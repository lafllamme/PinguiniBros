<template>
  <div class="cursor" />
</template>

<script setup lang="ts">
// Custom cursor component
// You can enhance this with custom cursor styles and animations
</script>

<style scoped>
.cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: difference;
  transition: transform 0.1s ease;
}

@media (hover: none) {
  .cursor {
    display: none;
  }
}
</style>
