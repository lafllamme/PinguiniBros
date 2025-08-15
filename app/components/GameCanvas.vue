<template>
  <div class="game-container">
    <canvas ref="gameCanvas" class="game-canvas"></canvas>
    <div v-if="!gameStarted" class="game-overlay">
      <div class="game-menu">
        <h2 class="text-2xl font-bold text-white mb-4">🐧 Pinguini Bros</h2>
        <p class="text-white mb-6">A fun platformer adventure!</p>
        <button 
          @click="startGame" 
          class="bg-blue-5 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import kaplay from 'kaplay'

const gameCanvas = ref<HTMLCanvasElement>()
const gameStarted = ref(false)
let gameInstance: any = null

const startGame = async () => {
  if (!gameCanvas.value) return
  
  gameStarted.value = true
  
  try {
    // Initialize KAPLAY
    gameInstance = kaplay({
      canvas: gameCanvas.value,
      width: 800,
      height: 600,
      scale: 1,
      global: true,
    })

    // Get KAPLAY functions
    const { loadSprite, scene, setGravity, add, sprite, pos, area, body, scale, onKeyDown, onKeyPress, text, go, destroy } = gameInstance

    // Load basic sprites
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create main game scene
    scene('game', () => {
      // Set gravity
      setGravity(1600)
      
      // Create player (penguin)
      const player = add([
        sprite('penguin'),
        pos(50, 400),
        area(),
        body(),
        {
          speed: 320,
          isOnGround: false
        }
      ])
      
      // Create ground (ice)
      add([
        sprite('ice'),
        pos(0, 550),
        area(),
        body({ isStatic: true }),
        scale(800, 50)
      ])
      
      // Create some ice platforms
      add([
        sprite('ice'),
        pos(200, 450),
        area(),
        body({ isStatic: true }),
        scale(100, 20)
      ])
      
      add([
        sprite('ice'),
        pos(400, 350),
        area(),
        body({ isStatic: true }),
        scale(100, 20)
      ])
      
      add([
        sprite('ice'),
        pos(600, 250),
        area(),
        body({ isStatic: true }),
        scale(100, 20)
      ])
      
      // Create collectible fish
      add([
        sprite('fish'),
        pos(250, 400),
        area(),
        'fish'
      ])
      
      add([
        sprite('fish'),
        pos(450, 300),
        area(),
        'fish'
      ])
      
      add([
        sprite('fish'),
        pos(650, 200),
        area(),
        'fish'
      ])
      
      // Player movement
      onKeyDown('left', () => {
        player.move(-player.speed, 0)
      })
      
      onKeyDown('right', () => {
        player.move(player.speed, 0)
      })
      
      onKeyPress('space', () => {
        if (player.isOnGround) {
          player.jump(640)
          player.isOnGround = false
        }
      })
      
      // Alternative controls
      onKeyDown('a', () => {
        player.move(-player.speed, 0)
      })
      
      onKeyDown('d', () => {
        player.move(player.speed, 0)
      })
      
      onKeyPress('w', () => {
        if (player.isOnGround) {
          player.jump(640)
          player.isOnGround = false
        }
      })
      
      // Collision detection
      player.onCollide('ice', () => {
        player.isOnGround = true
      })
      
      player.onCollide('fish', (fish) => {
        destroy(fish)
      })
      
      // UI
      add([
        text('Score: 0'),
        pos(20, 20),
        {
          id: 'scoreText',
          value: 0
        }
      ])
      
      add([
        text('Lives: 3'),
        pos(20, 50),
        {
          id: 'livesText',
          value: 3
        }
      ])
    })
    
    // Start the game
    go('game')
    
  } catch (error) {
    console.error('Failed to start game:', error)
    gameStarted.value = false
  }
}

onUnmounted(() => {
  if (gameInstance) {
    gameInstance.quit()
  }
})
</script>

<style scoped>
.game-container {
  position: relative;
  display: inline-block;
}

.game-canvas {
  border: 2px solid #333;
  border-radius: 8px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.game-menu {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 12px;
  border: 2px solid #4a90e2;
}
</style>
