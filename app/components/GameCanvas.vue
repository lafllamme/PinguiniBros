<template>
  <div ref="containerEl" class="game-container">
    <canvas
      ref="gameCanvas"
      v-show="gameStarted"
      :class="gameStarted && 'game-canvas'"
    />
    <div v-if="!gameStarted">
      <div class="grid grid-cols-1 my-48 justify-center rounded-3xl bg-pureBlack/40 backdrop-blur-lg">
        <div class="mx-10">
          <h1
              id="app-title"
              class="py-5 game-title text-5xl tracking-wide antialiased color-pureWhite font-barrio"
          >
            Penguini Bros
          </h1>
        </div>
        <p class="color-gray-2 text-center antialiased tracking-tight font-medium font-mono">A fun platformer adventure!</p>
        <div class="flex my-4 justify-center">
          <button
              @click="startGame"
              class="bg-plum-12 rounded-xl hover:bg-plum-11 font-pixelify transition-colors ease-out duration-200 color-pureWhite font-bold py-3 px-6 transition-colors"
          >
            Start Game
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed, shallowRef, watch} from 'vue'
import kaplay from 'kaplay'
// VueUse
import {useWindowSize, useElementSize, useDocumentVisibility} from '@vueuse/core'

const gameCanvas = ref<HTMLCanvasElement>()
const containerEl = ref<HTMLElement>()
const gameStarted = ref(false)
let gameInstance: any = null
let lobbyMusic: any = null

// Responsive sizing using VueUse
const {width: winW, height: winH} = useWindowSize()
const headerEl = shallowRef<HTMLElement | null>(null)
const {height: headerH} = useElementSize(headerEl)

const BASE_W = 800
const BASE_H = 600

function computeScale(): number {
  const availW = Math.max(320, Math.floor(winW.value * 0.6))
  const availH = Math.max(240, Math.floor(winH.value - headerH.value - 32))
  return Math.max(1, Math.min(availW / BASE_W, availH / BASE_H))
}

const startGame = async () => {
  if (!gameCanvas.value) return

  gameStarted.value = true

  try {
    // Compute a pixel-perfect scale so clicks map correctly (no CSS scaling)
    const scaleFactor = computeScale()

    // Initialize KAPLAY
    gameInstance = kaplay({
      canvas: gameCanvas.value,
      width: BASE_W,
      height: BASE_H,
      scale: scaleFactor,
      global: true,
    })

    // Get KAPLAY functions
    const {
      loadSprite,
      loadSound,
      play,
      scene,
      setGravity,
      add,
      sprite,
      pos,
      area,
      body,
      scale,
      onKeyDown,
      onKeyPress,
      onClick,
      text,
      go,
      destroy,
      rect,
      circle,
      color,
      anchor,
      layer,
      setLayers,
      z,
      setCamPos,
      width,
      height,
      fixed,
      onUpdate,
      lifespan,
      rand,
      opacity
    } = gameInstance

    // Load the provided PNG background from app/assets/sprites/canvas_bg.png
    const bgUrl = new URL('../assets/sprites/canvas_bg.png', import.meta.url).href
    loadSprite('level_bg', bgUrl)

    // Load animated player from assets/sprites/Owlet_Monster_Run_6.png (6 frames, 32x32)
    const owletUrl = new URL('../assets/sprites/Owlet_Monster_Run_6.png', import.meta.url).href
    loadSprite('player', owletUrl, {
      sliceX: 6,
      sliceY: 1,
      anims: {
        run: {from: 0, to: 5, speed: 8, loop: true},
      },
    })

    // Remove old coin assets; new ones are loaded via coin system

    // Load basic sprites with better colors
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

    // Configure layers ONCE globally (bg at back, ui on top)
    setLayers(['bg', 'game', 'ui'], 'game')

    // Create main game scene
    scene('game', ({level = 1} = {}) => {
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
          body({isStatic: true}),
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
        body({isStatic: true}),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(100, 20),
        pos(700, 380),
        area(),
        body({isStatic: true}),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(100, 20),
        pos(1100, 320),
        area(),
        body({isStatic: true}),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(120, 20),
        pos(1450, 300),
        area(),
        body({isStatic: true}),
        color(34, 139, 34),
        layer('game'),
        z(1),
        'ground'
      ])

      add([
        rect(140, 20),
        pos(1750, 260),
        area(),
        body({isStatic: true}),
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

      // Coins along the level will be spawned via coin system below

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

      // Coin collection handled inside coinSystem.makeCoin, but keep a guard for any stray coins
      player.onCollide('coin', (c: any) => {
        // No-op, coinSystem already destroys & updates score
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

      // ------------------------------------
      // Coin system: load assets and spawn
      // ------------------------------------
      ;(async () => {
        const {
          initCoinSystem,
          loadCoinAssets,
          spawnCoinsRandom,
          onScoreChanged,
          makeCoin,
          playLobbyMusic
        } = await import('../utils/coinSystem')
        initCoinSystem(gameInstance)
        await loadCoinAssets()
        // Start lobby music when game scene loads
        lobbyMusic = playLobbyMusic(0.6)
        // Spawn a few coins near start for immediate visibility
        makeCoin({x: 150, y: 500})
        makeCoin({x: 220, y: 500})
        makeCoin({x: 290, y: 500})
        // And random coins across the level
        spawnCoinsRandom(15, {x: 0, y: 0, w: LEVEL_WIDTH, h: 600}, {falling: false})
        onScoreChanged((n: number) => {
          score = n
          scoreText.text = `Score: ${score}`
        })
      })()
    })

    // Simple win scene
    scene('win', () => {
      add([
        text('You Win! 🎉', {size: 32}),
        pos(width() / 2, height() / 2 - 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      add([
        text('Press R to restart or Enter for Level Select', {size: 16}),
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
        text('Pinguini Bros', {size: 36}),
        pos(width() / 2, 180),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(100),
      ])

      const startBtn = add([
        text('Start', {size: 24}),
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
        text('Select Level', {size: 28}),
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
          text(String(i), {size: 18}),
          pos(startX + col * gapX, startY + row * gapY),
          anchor('center'),
          area(),
          layer('ui'),
          fixed(),
          z(100),
          `level-${i}`
        ])
        onClick(`level-${i}`, () => go('game', {level: i}))
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

// Mount-time wiring for header measurement & visibility audio pause/resume
onMounted(() => {
  headerEl.value = document.getElementById('app-title') as HTMLElement | null
  const visibility = useDocumentVisibility()
  watch(visibility, (v) => {
    if (!lobbyMusic) return
    if (v === 'visible') lobbyMusic.play()
    else lobbyMusic.pause()
  })

  // Adjust pixel scale on resize without re-initializing Kaplay
  watch(
    () => [winW.value, winH.value, headerH.value],
    () => {
      if (!gameInstance) return
      const s = computeScale()
      try { gameInstance.scale(s) } catch {}
    },
    { flush: 'post' }
  )
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


</style>
