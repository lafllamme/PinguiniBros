<template>
  <div class="game-container">
    <div class="container mx-auto px-4 py-8">
      <h1 class="game-title">
        🐧 Penguini Bros
      </h1>
      
      <!-- Demo von Radix-Farben und Features -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <!-- Radix Farben Demo -->
        <div class="card bg-slate-1 dark:bg-slate-8 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-slate-12 mb-4">Radix Farben</h3>
          <div class="space-y-2">
            <div class="h-8 bg-blue-5 rounded"></div>
            <div class="h-8 bg-green-5 rounded"></div>
            <div class="h-8 bg-purple-5 rounded"></div>
            <div class="h-8 bg-crimson-12 rounded"></div>
          </div>
        </div>
        
        <!-- Alpha Farben Demo -->
        <div class="card bg-slate-1 dark:bg-slate-8 p-6 rounded-lg">
          <h3 class="text-lg font-semibold text-slate-12 mb-4">Alpha Farben</h3>
          <div class="space-y-2">
            <div class="h-8 bg-mint-5 rounded"></div>
            <div class="h-8 bg-green-5A rounded"></div>
            <div class="h-8 bg-purple-5A rounded"></div>
            <div class="h-8 bg-red-5A rounded"></div>
          </div>
        </div>
      </div>
      
      <!-- Game Canvas -->
      <div class="flex justify-center">
        <GameCanvas />
      </div>
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
