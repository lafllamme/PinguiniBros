<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <!-- Game Canvas - immer zentriert -->
    <div ref="containerEl" class="game-container">
      <canvas
        ref="gameCanvas"
        v-show="gameStarted"
        :class="gameStarted && 'game-canvas'"
      />
    </div>
    
    <!-- Overlay Menu - nur wenn Spiel nicht gestartet -->
    <div v-if="!gameStarted" class="absolute inset-0 flex items-center justify-center">
      <div class="grid grid-cols-1 justify-center rounded-3xl bg-pureBlack/40 backdrop-blur-lg p-8">
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
import { useCookie } from '#app'
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
  const availW = Math.max(320, Math.floor(winW.value * 0.9))
  const availH = Math.max(240, Math.floor(winH.value * 0.9))
  return Math.max(1, Math.min(availW / BASE_W, availH / BASE_H))
}

const startGame = async () => {
  if (!gameCanvas.value) return

  gameStarted.value = true

  try {
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
      opacity,
      onKeyRelease
    } = gameInstance

    // Load the provided PNG background from app/assets/sprites/canvas_bg.png
    const bgUrl = new URL('../assets/sprites/canvas_bg.png', import.meta.url).href
    loadSprite('level_bg', bgUrl)

    // Persistent save cookie (score + lives)
    const saveCookie = useCookie('pb_state', {
      default: () => ({ score: 0, lives: 3, lastLevel: 1 }),
    })

    // Load animated player from assets/sprites/Owlet_Monster_Run_6.png (6 frames, 32x32)
    const owletUrl = new URL('../assets/sprites/Owlet_Monster_Run_6.png', import.meta.url).href
    loadSprite('player', owletUrl, {
      sliceX: 6,
      sliceY: 1,
      anims: {
        run: {from: 0, to: 5, speed: 8, loop: true},
      },
    })

    // Load idle sprite animation
    const idleUrl = new URL('../assets/sprites/Owlet_Monster_Idle_4.png', import.meta.url).href
    loadSprite('player_idle', idleUrl, {
      sliceX: 4,
      sliceY: 1,
      anims: {
        idle: {from: 0, to: 3, speed: 6, loop: true},
      },
    })

    // Load jump sprite animation
    const jumpUrl = new URL('../assets/sprites/Owlet_Monster_Jump_8.png', import.meta.url).href
    loadSprite('player_jump', jumpUrl, {
      sliceX: 8,
      sliceY: 1,
      anims: {
        jump: {from: 0, to: 7, speed: 12, loop: false},
      },
    })

    // Load attack sprite animation (6 frames)
    const attackUrl = new URL('../assets/sprites/Owlet_Monster_Attack2_6.png', import.meta.url).href
    loadSprite('player_attack', attackUrl, {
      sliceX: 6,
      sliceY: 1,
      anims: {
        attack: { from: 0, to: 5, speed: 12, loop: false },
      },
    })

    // Load Skeleton enemy sprite-sheet (832x320, 5 rows)
    // Rows: Attack(13), Death(13), Walk(12), Idle(4), Hit(3)
    try {
      const skeletonUrl = new URL('../assets/sprites/Skeleton_Enemy.png', import.meta.url).href
      loadSprite('skeleton', skeletonUrl, {
        sliceX: 13,
        sliceY: 5,
        anims: {
          // Row 0: 0..12 (13)
          attack: { from: 0, to: 12, speed: 12, loop: false },
          // Row 1: 13..25 (13)
          dead:   { from: 13, to: 25, speed: 8, loop: false },
          // Row 2: 26..37 (12 valid frames)
          walk:   { from: 26, to: 37, speed: 12, loop: true },
          // Row 3 starts at index 39, 4 frames → 39..42
          idle:   { from: 39, to: 42, speed: 8, loop: true },
          // Row 4 starts at index 52, 3 frames → 52..54
          hit:    { from: 52, to: 54, speed: 12, loop: false },
        },
      })
    } catch {}

    // Remove old coin assets; new ones are loaded via coin system

    // Load basic sprites with better colors
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')

    // Configure layers ONCE globally (bg at back, ui on top)
    setLayers(['bg', 'game', 'ui'], 'game')

    // Create main game scene
    scene('game', ({level = 1, lives = 3} = {}) => {
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
        sprite('player_idle'),
        pos(50, 450),
        anchor('center'),
        area(),
        body(),
        // make player globally larger
        scale(1.5),
        layer('game'),
        z(10),
        'player'
      ])

      // Add custom properties to player
      player.speed = 320
      player.isOnGround = false
      player.canDoubleJump = true
      player.jumpCount = 0
      player.maxJumps = 2
      player.jumpForce = 640
      player.jumpState = false
      player.facingRight = true
      player.isMoving = false

      // start idle animation automatically
      player.play('idle')
      ;(player as any).facingRight = true
      ;(player as any).isAttacking = false
      ;(player as any).canDamage = false
      ;(player as any)._lastSprite = 'player_idle'
      ;(player as any)._lastAnim = 'idle'

      // -----------------------------
      // Player Health (Level UI)
      // -----------------------------
      const PLAYER_MAX_HP = 10
      const PLAYER_HP_BAR_WIDTH = 24
      const PLAYER_HP_BAR_HEIGHT = 3
      player.health = PLAYER_MAX_HP

      const hpBg = add([
        rect(PLAYER_HP_BAR_WIDTH + 4, PLAYER_HP_BAR_HEIGHT + 2),
        pos(player.pos.x, player.pos.y - 50),
        anchor('center'),
        color(0, 0, 0),
        layer('ui'),
        z(200),
        'playerHpBg'
      ])

      const hpBar = add([
        rect(PLAYER_HP_BAR_WIDTH, PLAYER_HP_BAR_HEIGHT),
        pos(player.pos.x, player.pos.y - 50),
        anchor('center'),
        color(0, 255, 0),
        layer('ui'),
        z(201),
        'playerHpBar'
      ])

      function updatePlayerHpBar() {
        const pct = Math.max(0, player.health) / PLAYER_MAX_HP
        const w = Math.round(PLAYER_HP_BAR_WIDTH * pct)
        hpBar.width = w
        if (pct > 0.6) hpBar.color = color(0, 255, 0)
        else if (pct > 0.3) hpBar.color = color(255, 255, 0)
        else hpBar.color = color(255, 0, 0)
      }
      updatePlayerHpBar()

      // Follow player (snap to integer pixels)
      onUpdate(() => {
        const uiX = Math.round(player.pos.x)
        const uiY = Math.round(player.pos.y - 50)
        hpBg.pos.x = uiX
        hpBg.pos.y = uiY
        hpBar.pos.x = uiX
        hpBar.pos.y = uiY
      })

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

      // Helper function to set sprite with correct direction
      function setPlayerSprite(spriteName: string, animationName: string, force = false) {
        const p: any = player
        if (p.isAttacking && !force) return
        // Avoid resetting the same animation every frame (onKeyDown fires continuously)
        if (!force && p._lastSprite === spriteName && p._lastAnim === animationName) {
          player.flipX = !p.facingRight
          return
        }
        player.use(sprite(spriteName))
        player.play(animationName)
        player.flipX = !p.facingRight
        p._lastSprite = spriteName
        p._lastAnim = animationName
      }

      // Player movement
      onKeyDown('left', () => {
        player.move(-player.speed, 0)
        player.facingRight = false
        player.isMoving = true
        // Switch to run animation when moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player', 'run')
        }
      })

      onKeyDown('right', () => {
        player.move(player.speed, 0)
        player.facingRight = true
        player.isMoving = true
        // Switch to run animation when moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player', 'run')
        }
      })

      onKeyRelease('left', () => {
        player.isMoving = false
        // Switch back to idle when not moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyRelease('right', () => {
        player.isMoving = false
        // Switch back to idle when not moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      // Enhanced jump function
      function performJump() {
        if (player.jumpCount < player.maxJumps) {
          player.jumpCount++
          player.jumpState = true
          player.isOnGround = false
          
          // Switch to jump sprite and play animation
          setPlayerSprite('player_jump', 'jump')
          
          // Apply jump force
          player.jump(player.jumpForce)
          
          // Reset to appropriate sprite after jump animation completes
          setTimeout(() => {
            if (player.isOnGround) {
              player.jumpState = false
              // Switch back to idle or run based on movement state
              if (player.isMoving) {
                setPlayerSprite('player', 'run')
              } else {
                setPlayerSprite('player_idle', 'idle')
              }
            }
          }, 800) // Longer timing to see the jump animation
        }
      }

      // Player attack with X (scale 1.5 and transient hitbox)
      function performAttack() {
        const p: any = player
        if (p.isAttacking) return
        p.isAttacking = true
        // set attack sprite, preserve facing
        player.use(sprite('player_attack'))
        player.play('attack')
        player.flipX = !p.facingRight
        // hitbox
        const dir = p.facingRight ? 1 : -1
        const hb = add([
          rect(36, 24),
          pos(player.pos.x + dir * 28, player.pos.y - 4),
          anchor('center'),
          area(),
          layer('game'),
          z(15),
          opacity(0),
          'playerAttack',
          lifespan(0.25, { fade: 0 })
        ])
        // damage enemies on collide
        hb.onCollide('skeleton', (sk: any) => {
          sk.trigger?.('playerAttack')
        })
        // full anim time: 6 frames @ 12 fps ≈ 500ms
        setTimeout(() => {
          p.isAttacking = false
          // return to proper animation immediately, even if keys are still held
          if (player.isOnGround) {
            if (player.isMoving) setPlayerSprite('player', 'run', true)
            else setPlayerSprite('player_idle', 'idle', true)
          } else {
            setPlayerSprite('player_jump', 'jump', true)
          }
        }, 520)
      }

      onKeyPress('space', () => {
        performJump()
      })
      onKeyPress('x', () => {
        performAttack()
      })

      // Arrow Up jump as well
      onKeyPress('up', () => {
        performJump()
      })

      // Alternative controls
      onKeyDown('a', () => {
        player.move(-player.speed, 0)
        player.facingRight = false
        player.isMoving = true
        // Switch to run animation when moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player', 'run')
        }
      })

      onKeyDown('d', () => {
        player.move(player.speed, 0)
        player.facingRight = true
        player.isMoving = true
        // Switch to run animation when moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player', 'run')
        }
      })

      onKeyRelease('a', () => {
        player.isMoving = false
        // Switch back to idle when not moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyRelease('d', () => {
        player.isMoving = false
        // Switch back to idle when not moving
        if (player.isOnGround && !player.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyPress('w', () => {
        performJump()
      })

      // Collision detection
      player.onCollide('ground', () => {
        player.isOnGround = true
        player.jumpCount = 0
        player.canDoubleJump = true
        
        // Switch back to appropriate sprite when landing
        if (player.jumpState) {
          player.jumpState = false
          // Switch back to idle or run based on movement state
          if (player.isMoving) {
            setPlayerSprite('player', 'run')
          } else {
            setPlayerSprite('player_idle', 'idle')
          }
        }
      })

      // Coin collection handled inside coinSystem.makeCoin, but keep a guard for any stray coins
      player.onCollide('coin', (c: any) => {
        // No-op, coinSystem already destroys & updates score
      })

      // UI with colors that match the background
      // initialize from cookie
      if (!saveCookie.value) saveCookie.value = { score: 0, lives, lastLevel: level }
      let score = typeof saveCookie.value.score === 'number' ? saveCookie.value.score : 0
      const scoreText = add([
        text(''),
        pos(20, 20),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
      ])
      scoreText.text = `Score: ${score}`

      // Use lives passed from scene params, fall back to 3
      if (typeof lives !== 'number') lives = typeof saveCookie.value.lives === 'number' ? saveCookie.value.lives : 3
      const livesText = add([
        text(''),
        pos(20, 50),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
      ])
      // set initial lives display based on param
      livesText.text = `Lives: ${lives}`
      // keep cookie in sync
      saveCookie.value = { score, lives, lastLevel: level }

      // -----------------------------
      // Pause system
      // -----------------------------
      let gamePaused = false
      let soundMuted = false
      let pauseOverlay: any = null
      let pauseTitle: any = null
      let pauseSoundBtn: any = null
      let pauseMenuBtn: any = null

      function showPause() {
        if (gamePaused) return
        gamePaused = true
        // Dim screen
        pauseOverlay = add([
          rect(width(), height()),
          pos(width() / 2, height() / 2),
          anchor('center'),
          color(0, 0, 0, 0.6),
          layer('ui'),
          fixed(),
          z(999)
        ])
        pauseTitle = add([
          text('Paused', { size: 24 }),
          pos(width() / 2, height() / 2 - 40),
          anchor('center'),
          layer('ui'),
          fixed(),
          z(1000),
        ])
        pauseSoundBtn = add([
          text(soundMuted ? 'Sound: Off' : 'Sound: On', { size: 18 }),
          pos(width() / 2, height() / 2),
          anchor('center'),
          area(),
          layer('ui'),
          fixed(),
          z(1000),
          'pauseSoundBtn'
        ])
        pauseMenuBtn = add([
          text('Back to Menu', { size: 18 }),
          pos(width() / 2, height() / 2 + 40),
          anchor('center'),
          area(),
          layer('ui'),
          fixed(),
          z(1000),
          'pauseMenuBtn'
        ])
      }

      function hidePause() {
        if (!gamePaused) return
        gamePaused = false
        if (pauseOverlay) destroy(pauseOverlay)
        if (pauseTitle) destroy(pauseTitle)
        if (pauseSoundBtn) destroy(pauseSoundBtn)
        if (pauseMenuBtn) destroy(pauseMenuBtn)
        pauseOverlay = pauseTitle = pauseSoundBtn = pauseMenuBtn = null
      }

      onClick('pauseSoundBtn', () => {
        soundMuted = !soundMuted
        if (typeof lobbyMusic?.pause === 'function' && typeof lobbyMusic?.play === 'function') {
          if (soundMuted) lobbyMusic.pause()
          else lobbyMusic.play()
        }
        if (pauseSoundBtn) pauseSoundBtn.text = soundMuted ? 'Sound: Off' : 'Sound: On'
      })

      onClick('pauseMenuBtn', () => {
        go('menu')
      })

      onKeyPress('escape', () => {
        if (gamePaused) hidePause()
        else showPause()
      })

      // Damage + lives
      // lives already declared above
      function applyDamage(dmg: number) {
        if (player.health <= 0) return
        player.health = Math.max(0, player.health - dmg)
        updatePlayerHpBar()
        if (player.health <= 0) {
          lives -= 1
          livesText.text = `Lives: ${lives}`
          saveCookie.value = { score, lives, lastLevel: level }
          if (lives <= 0) {
            go('gameOver', { level })
          } else {
            // restart same level with one fewer life
            go('game', { level, lives })
          }
        }
      }

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

      // -----------------------------
      // Level 2 content (skeletons)
      // -----------------------------
      if (level >= 2) {
        const createSkeleton = (x: number, y: number) => {
          const sk = add([
            sprite('skeleton'),
            pos(x, y),
            anchor('center'),
            // Slightly larger skeleton for clarity, tighter collider; push collider down to feet (negative y)
            scale(1.5),
            area({ width: 24, height: 48, offset: { x: 0, y: -22 } }),
            body(),
            layer('game'),
            z(5),
            'enemy',
            'skeleton',
            {
              speed: 80,
              direction: 1,
              health: 3,
              maxHealth: 3,
              isAttacking: false,
              isDead: false,
              patrolStart: x - 100,
              patrolEnd: x + 100,
            },
          ])
          sk.play('idle')
          ;(sk as any)._lastAnim = 'idle'

          function setSkAnim(name: string) {
            const last = (sk as any)._lastAnim
            if (last !== name) {
              sk.play(name)
              ;(sk as any)._lastAnim = name
            }
          }

          // Small hp bar above skeleton
          const skBg = add([
            rect(42, 8),
            pos(x, y - 60),
            anchor('center'),
            color(0, 0, 0),
            layer('ui'),
            z(19),
          ])
          const skHp = add([
            rect(40, 6),
            pos(x, y - 60),
            anchor('center'),
            color(0, 255, 0),
            layer('ui'),
            z(20),
          ])
          function updateSkHp() {
            const p = sk.health / sk.maxHealth
            skHp.width = Math.round(40 * p)
            skHp.color = p > 0.5 ? color(0, 255, 0) : p > 0.25 ? color(255, 255, 0) : color(255, 0, 0)
          }
          updateSkHp()

          // Desired colliders for ground vs air
          const groundBox = { w: 24, h: 48, oy: -22 }
          const airBox = { w: 20, h: 42, oy: -16 }
          let lastBox: 'ground' | 'air' = 'ground'

          onUpdate(() => {
            if (sk.isDead) return
            // Follow hp bar
            const uiX = Math.round(sk.pos.x)
            const uiY = Math.round(sk.pos.y - 60)
            skBg.pos.x = uiX; skBg.pos.y = uiY
            skHp.pos.x = uiX; skHp.pos.y = uiY

            // Dynamically tighten collider while in air
            const airborne = Math.abs(sk.vel.y) > 1
            if (airborne && lastBox !== 'air') {
              if (sk.area) {
                sk.area.width = airBox.w
                sk.area.height = airBox.h
                sk.area.offset = { x: 0, y: airBox.oy }
              }
              lastBox = 'air'
            } else if (!airborne && lastBox !== 'ground') {
              if (sk.area) {
                sk.area.width = groundBox.w
                sk.area.height = groundBox.h
                sk.area.offset = { x: 0, y: groundBox.oy }
              }
              lastBox = 'ground'
            }

            // Simple chase / patrol
            const dx = player.pos.x - sk.pos.x
            const dist = Math.abs(dx)
            if (dist < 160 && !sk.isAttacking) {
              // chase
              sk.direction = dx > 0 ? 1 : -1
              sk.flipX = sk.direction < 0
              sk.vel.x = sk.speed * sk.direction
              setSkAnim('walk')
            } else if (!sk.isAttacking) {
              // patrol
              sk.vel.x = sk.speed * sk.direction
              if (sk.pos.x <= sk.patrolStart) { sk.direction = 1; sk.flipX = false }
              if (sk.pos.x >= sk.patrolEnd) { sk.direction = -1; sk.flipX = true }
              // randomly idle sometimes
              if (Math.random() < 0.004) {
                sk.vel.x = 0
                setSkAnim('idle')
              } else {
                setSkAnim(Math.abs(sk.vel.x) > 1 ? 'walk' : 'idle')
              }
            }

            // attack if close
            if (dist < 70 && !sk.isAttacking) {
              sk.isAttacking = true
              sk.vel.x = 0
              setSkAnim('attack')
              const hit = add([
                rect(70, 50),
                pos(sk.pos.x + sk.direction * 35, sk.pos.y),
                anchor('center'),
                area(),
                layer('game'),
                z(10),
                opacity(0),
                'skeletonAttack',
                lifespan(0.35, { fade: 0 })
              ])
              // damage player when overlapping this attack hitbox
              hit.onCollide('player', () => applyDamage(1))
              setTimeout(() => {
                sk.isAttacking = false
                if (!sk.isDead) setSkAnim('walk')
              }, 700)
            }
          })

          // When hit by player attack (placeholder tag)
          sk.onCollide('playerAttack', () => {
            if (sk.isDead) return
            sk.health -= 1
            updateSkHp()
            setSkAnim('hit')
            if (sk.health <= 0) {
              sk.isDead = true
              setSkAnim('dead')
              sk.vel.x = 0; sk.vel.y = 0
              destroy(skBg); destroy(skHp)
              setTimeout(() => destroy(sk), 1600)
            }
          })

          return sk
        }

        createSkeleton(400, 500)
        createSkeleton(800, 500)
        createSkeleton(1200, 500)
      }

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
        // Save progress on level finish
        saveCookie.value = { score, lives, lastLevel: level }
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
          playLobbyMusic,
          setScore
        } = await import('../utils/coinSystem')
        initCoinSystem(gameInstance)
        await loadCoinAssets()
        // Start lobby music when game scene loads
        lobbyMusic = playLobbyMusic(0.6)
        // Initialize coin score from cookie so increments continue correctly
        try { setScore(score) } catch {}
        // Spawn a few coins near start for immediate visibility
        makeCoin({x: 150, y: 500})
        makeCoin({x: 220, y: 500})
        makeCoin({x: 290, y: 500})
        // And random coins across the level
        spawnCoinsRandom(15, {x: 0, y: 0, w: LEVEL_WIDTH, h: 600}, {falling: false})
        onScoreChanged((n: number) => {
          score = n
          scoreText.text = `Score: ${score}`
          saveCookie.value = { score, lives, lastLevel: level }
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

    // Game over scene
    scene('gameOver', ({ level = 1 } = {}) => {
      add([
        text('Game Over! 💀', {size: 32}),
        pos(width() / 2, height() / 2 - 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      add([
        text('Press Enter to retry level, or M for Menu', {size: 16}),
        pos(width() / 2, height() / 2 + 20),
        anchor('center'),
        layer('ui'),
        fixed(),
        z(101),
      ])

      onKeyPress('enter', () => go('game', { level, lives: 3 }))
      onKeyPress('return', () => go('game', { level, lives: 3 }))
      onKeyPress('kpenter', () => go('game', { level, lives: 3 }))
      onKeyPress('m', () => go('menu'))
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

    // Start at menu; preload last cookie state to set default level/lives
    if (saveCookie.value?.lastLevel && saveCookie.value?.lives >= 0) {
      // nothing else here; menu will read cookie when entering game
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
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
