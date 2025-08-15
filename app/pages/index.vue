<template>
  <div class="bg-mint-6 h-svh">
    <div class="mx-10">
        <h1 class="py-5 game-title text-5xl tracking-wide antialiased color-pureBlack font-barrio">
          🐧 Penguini Bros
        </h1>
    </div>
    <!-- Game Canvas -->
    <div class="flex justify-center">
      <GameCanvas />
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from '@/components/GameCanvas.vue'

// Meta tags for the game
useHead({
  title: 'Penguini Bros - KAPLAY Game',
  meta: [
    { name: 'description', content: 'A fun platformer game built with KAPLAY and Nuxt' }
  ]
})
</script>
