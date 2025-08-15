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
    const { loadSprite, loadSound, play, scene, setGravity, add, sprite, pos, area, body, scale, onKeyDown, onKeyPress, onClick, text, go, destroy, rect, circle, color, anchor, layer, setLayers, z, setCamPos, width, height, fixed, onUpdate } = gameInstance

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

    // Simple coin sprite (gold circle via generated sprite)
    loadSprite('coin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAADUlEQVR42mNgGAWjYBQAAAgAAa0m1q0AAAAASUVORK5CYII=')

    // Placeholder collect sound (short beep)
    loadSound('collect', 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAAA')
    
    // Load basic sprites with better colors
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Configure layers ONCE globally (bg at back, ui on top)
    setLayers(['bg', 'game', 'ui'], 'game')

    // Create main game scene
    scene('game', ({ level = 1 } = {}) => {
      const LEVEL_WIDTH = 2400
      // Set gravity
      setGravity(1600)
      
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
      
      // Coins along the level
      const coinPositions = [
        pos(350, 420), pos(380, 420), pos(410, 420),
        pos(720, 350), pos(750, 350), pos(780, 350),
        pos(1120, 290), pos(1150, 290),
        pos(1480, 270), pos(1510, 270),
        pos(1780, 230), pos(1810, 230),
      ]
      coinPositions.forEach((p) => {
        add([
          sprite('coin'),
          p,
          area(),
          layer('game'),
          z(2),
          'coin'
        ])
      })
      
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
      
      player.onCollide('coin', (c: any) => {
        destroy(c)
        score += 1
        scoreText.text = `Score: ${score}`
        play('collect')
      })
      
      // UI with colors that match the background
      let score = 0
      const scoreText = add([
        text('Score: 0'),
        pos(20, 20),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
      ])
      
      let lives = 3
      const livesText = add([
        text('Lives: 3'),
        pos(20, 50),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
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
        setCamPos(targetX, height() / 2)
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
        text('Press R to restart or Enter for Level Select', { size: 16 }),
        pos(width() / 2, height() / 2 + 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      onKeyPress('r', () => go('game'))
      onKeyPress('enter', () => go('levelSelect'))
      onKeyPress('return', () => go('levelSelect'))
      onKeyPress('kpenter', () => go('levelSelect'))
      onKeyPress('space', () => go('levelSelect'))
    })

    // Menu scene -> Go to level select
    scene('menu', () => {
      add([
        sprite('level_bg'),
        pos(0, 0),
        anchor('topleft'),
        layer('bg'),
        fixed(),
      ])

      const title = add([
        text('Pinguini Bros', { size: 36 }),
        pos(width() / 2, 180),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(100),
      ])

      const startBtn = add([
        text('Start', { size: 24 }),
        pos(width() / 2, 260),
        anchor('center'),
        area(),
        layer('ui'),
        fixed(),
        z(100),
        'startBtn'
      ])

      onClick('startBtn', () => go('levelSelect'))
      onKeyPress('enter', () => go('levelSelect'))
      onKeyPress('return', () => go('levelSelect'))
      onKeyPress('kpenter', () => go('levelSelect'))
      onKeyPress('space', () => go('levelSelect'))
    })

    // Level select scene (mock 1..99)
    scene('levelSelect', () => {
      add([
        sprite('level_bg'),
        pos(0, 0),
        anchor('topleft'),
        layer('bg'),
        fixed(),
      ])

      add([
        text('Select Level', { size: 28 }),
        pos(width() / 2, 120),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(100),
      ])

      const cols = 10
      const startX = 120
      const startY = 180
      const gapX = 60
      const gapY = 40
      for (let i = 1; i <= 99; i++) {
        const col = (i - 1) % cols
        const row = Math.floor((i - 1) / cols)
        const btn = add([
          text(String(i), { size: 18 }),
          pos(startX + col * gapX, startY + row * gapY),
          anchor('center'),
          area(),
          layer('ui'),
          fixed(),
          z(100),
          `level-${i}`
        ])
        onClick(`level-${i}`, () => go('game', { level: i }))
      }

      onKeyPress('escape', () => go('menu'))
    })
    
    // Start at menu
    go('menu')
    
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
