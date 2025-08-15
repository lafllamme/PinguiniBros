<template>
  <div class="game-container">
    <canvas ref="gameCanvas" class="game-canvas"></canvas>
    <div v-if="!gameStarted" class="game-overlay">
      <div class="game-menu">
        <h2 class="text-2xl font-bold text-white mb-4">🐧 Pinguini Bros</h2>
        <p class="text-white mb-6">A fun platformer adventure!</p>
        <button 
          @click="startGame" 
          class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
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
    const { loadSprite, scene, setGravity, add, sprite, pos, area, body, scale, onKeyDown, onKeyPress, text, go, destroy, rect, color, anchor, layer, layers, z, camPos, width, height, fixed, onUpdate } = gameInstance

    // Load the provided PNG background from app/assets/sprites/canvas_bg.png
    const bgUrl = new URL('../assets/sprites/canvas_bg.png', import.meta.url).href
    loadSprite('level_bg', bgUrl)

    // Load animated player from assets/sprites/Owlet_Monster_Run_6.png (6 frames, 32x32)
    const owletUrl = new URL('../assets/sprites/Owlet_Monster_Run_6.png', import.meta.url).href
    loadSprite('player', owletUrl, {
      sliceX: 6,
      sliceY: 1,
      anims: {
        run: { from: 0, to: 5, speed: 8, loop: true },
      },
    })
    
    // Load basic sprites with better colors
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Create main game scene
    scene('game', () => {
      const LEVEL_WIDTH = 2400
      // Set gravity
      setGravity(1600)
      
      // Define layers and add the PNG background on the back layer
      layers([ 'bg', 'game', 'ui' ], 'game')
      add([
        sprite('level_bg'),
        pos(0, 0),
        anchor('topleft'),
        layer('bg'),
        fixed(),
      ])
      
      // Create player using your player.png sprite
      const player = add([
        sprite('player'),
        pos(50, 450),
        anchor('center'),
        area(),
        body(),
        layer('game'),
        z(10),
        'player',
        {
          speed: 320,
          isOnGround: false
        }
      ])

      // start run animation automatically
      player.play('run')
      
      // Create ground across the entire level width
      for (let x = 0; x < LEVEL_WIDTH; x += 200) {
        add([
          rect(200, 50),
          pos(x, 550),
          area(),
          body({ isStatic: true }),
          color(139, 69, 19),
          layer('game'),
          z(1),
          'ground'
        ])
      }
      
      // Grass platforms (green layer)
      add([
        rect(100, 20),
        pos(300, 450),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])
      
      add([
        rect(100, 20),
        pos(700, 380),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])
      
      add([
        rect(100, 20),
        pos(1100, 320),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(120, 20),
        pos(1450, 300),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(140, 20),
        pos(1750, 260),
        area(),
        body({ isStatic: true }),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      // Goal at the end of the level
      add([
        rect(20, 120),
        pos(LEVEL_WIDTH - 80, 430),
        area(),
        color(255, 215, 0),
        layer('game'),
        z(2),
        'goal'
      ])
      
      // Create collectible fish with orange color to match the flowers
      add([
        sprite('fish'),
        pos(250, 400),
        area(),
        color(255, 165, 0),
        layer('game'),
        z(2),
        'fish'
      ])
      
      add([
        sprite('fish'),
        pos(450, 300),
        area(),
        color(255, 165, 0),
        layer('game'),
        z(2),
        'fish'
      ])
      
      add([
        sprite('fish'),
        pos(650, 200),
        area(),
        color(255, 165, 0),
        layer('game'),
        z(2),
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

      // Arrow Up jump as well
      onKeyPress('up', () => {
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
      player.onCollide('ground', () => {
        player.isOnGround = true
      })
      
      player.onCollide('fish', (fish: any) => {
        destroy(fish)
      })
      
      // UI with colors that match the background
      add([
        text('Score: 0'),
        pos(20, 20),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
        {
          id: 'scoreText',
          value: 0
        }
      ])
      
      add([
        text('Lives: 3'),
        pos(20, 50),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
        {
          id: 'livesText',
          value: 3
        }
      ])
      
      // Add some decorative elements that match the background
      // Orange flowers like in the background
      add([
        rect(8, 8),
        pos(300, 520),
        color(255, 165, 0),
        layer('game'),
        'decoration'
      ])
      
      add([
        rect(8, 8),
        pos(500, 520),
        color(255, 165, 0),
        layer('game'),
        'decoration'
      ])
      
      add([
        rect(8, 8),
        pos(700, 520),
        color(255, 165, 0),
        layer('game'),
        'decoration'
      ])

      // Camera follow (x only), keep background fixed
      onUpdate(() => {
        let targetX = player.pos.x
        const half = width() / 2
        if (targetX < half) targetX = half
        if (targetX > LEVEL_WIDTH - half) targetX = LEVEL_WIDTH - half
        camPos(targetX, height() / 2)
      })

      // Win condition
      player.onCollide('goal', () => {
        go('win')
      })
    })

    // Simple win scene
    scene('win', () => {
      add([
        text('You Win! 🎉', { size: 32 }),
        pos(width() / 2, height() / 2 - 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      add([
        text('Press R to restart', { size: 16 }),
        pos(width() / 2, height() / 2 + 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      onKeyPress('r', () => go('game'))
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
