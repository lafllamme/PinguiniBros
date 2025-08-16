<template>
  <div class="bg-gradient-to-r from-emerald-400 to-cyan-400 h-svh">
    <!-- Game Canvas -->
    <div class="flex justify-center">
      <GameCanvas/>
    </div>
  </div>
</template>

<script setup lang="ts">
import GameCanvas from '@/components/GameCanvas.vue'

// Meta tags for the game
useHead({
  title: 'Penguini Bros - KAPLAY Game',
  meta: [
    {name: 'description', content: 'A fun platformer game built with KAPLAY and Nuxt'}
  ]
})
</script>
