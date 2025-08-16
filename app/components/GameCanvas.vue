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
            autofocus
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
import { GameScene } from '@/assets/scenes/GameScene'
import { Level1 } from '@/assets/levels/level_1'
import { Level2 } from '@/assets/levels/level_2'
import { onScoreChanged, initScore } from '@/utils/coinSystem'
import { initAssetLoader, loadAllAssets } from '../utils/AssetLoader'
import kaplay from 'kaplay'
// VueUse
import {useWindowSize, useElementSize, useDocumentVisibility} from '@vueuse/core'

const gameCanvas = ref<HTMLCanvasElement>()
const containerEl = ref<HTMLElement>()
const gameStarted = ref(false)
let gameInstance: any = null
let lobbyMusic: any = null
const game = useGameStore()

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
      get,
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

    // Preload all assets once before any scene
    initAssetLoader(gameInstance)
    await loadAllAssets()

    // Global Phase System - Level-based background selection
    const loadPhaseBackground = (level: number) => {
      // Levels 1-2 use phase1, level 3+ uses phase2
      const phaseName = level >= 3 ? 'phase2' : 'phase1'
      const bgUrl = new URL(`../assets/sprites/general/${phaseName}.png`, import.meta.url).href
      
      loadSprite('level_bg', bgUrl)
      console.log(`🎨 Loading phase background: ${phaseName} for level ${level}`)
    }

    // Load background based on current level
    loadPhaseBackground(game.currentLevel)

    // Persistent save cookie (score + lives)
    const saveCookie = useCookie('pb_state', {
      default: () => ({ score: 0, lives: 3, lastLevel: 1 }),
    })

    // Load saved state into Pinia store
    if (saveCookie.value) {
      game.score = saveCookie.value.score || 0
      game.lives = saveCookie.value.lives || 3
      game.currentLevel = saveCookie.value.lastLevel || 1
    }

    // Initialize coin system with current score
    initScore(game.score)

    // Configure layers ONCE globally (bg at back, ui on top)
    setLayers(['bg', 'game', 'ui'], 'game')

    // Create main game scene using extracted GameScene
    scene('game', ({level = 1, lives = 3} = {}) => {
      // Load phase background for this level
      loadPhaseBackground(level)
      
      const chosen = level >= 2 ? Level2 : Level1
      const gs = new GameScene(chosen)
      gs.init()

      // Add custom properties to player
      const player = get('player')[0]
      if (!player) return
      player.speed = 320
      player.isOnGround = false
      player.canDoubleJump = true
      player.jumpCount = 0
      player.maxJumps = 2
      player.jumpForce = 640
      player.jumpState = false
      player.facingRight = true
      player.isMoving = false
      player.isDead = false
      
      // Disable pushing against enemies by making player body non-solid against enemies
      if (player.body) {
        player.body.onCollide('enemy', () => {
          // Prevent pushing by stopping movement when colliding with enemies
          player.vel.x = 0
        })
      }

      // start idle animation automatically
      player.play('idle')
      ;(player as any).facingRight = true
      ;(player as any).isAttacking = false
      ;(player as any).canDamage = false
      ;(player as any)._lastSprite = 'player_idle'
      ;(player as any)._lastAnim = 'idle'

      // Prevent pushing enemies around: block movement when colliding with them
      let blockLeft = false
      let blockRight = false
      player.onCollide('enemy', (e: any) => {
        if (!e) return
        const dx = e.pos.x - player.pos.x
        if (dx > 0) blockRight = true
        else blockLeft = true
        player.vel.x = 0
      })
      player.onCollideEnd('enemy', () => {
        blockLeft = false
        blockRight = false
      })

      // Player Health UI is created and managed inside GameScene.createPlayerUI()

      // Create ground across the entire level width
      for (let x = 0; x < chosen.width; x += 200) {
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
        pos(chosen.width - 80, 430),
        area(),
        color(255, 215, 0),
        layer('game'),
        z(2),
        'goal'
      ])

      // Coins along the level will be spawned via coin system below

      // Helper function to play random hit sound
      function playRandomHitSound() {
        const hitSounds = [
          'owl_hit_1', 'owl_hit_2', 'owl_hit_3', 'owl_hit_4', 'owl_hit_5', 'owl_hit_6',
          'owl_hit_7', 'owl_hit_8', 'owl_hit_9', 'owl_hit_10', 'owl_hit_11', 'owl_hit_12'
        ]
        const randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)]
        play(randomSound, { volume: 0.3 })
      }

      // Helper function to set sprite with correct direction
      function setPlayerSprite(spriteName: string, animationName: string, force = false) {
        const p: any = player
        if (p.isAttacking && !force) return
        if (p.isDead && !force) return // Don't change sprite during death unless forced
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
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        if (blockLeft) {
          pl.isMoving = false
          if (pl.isOnGround && !pl.jumpState) setPlayerSprite('player_idle', 'idle')
          return
        }
        {
          pl.move(-pl.speed, 0)
          pl.facingRight = false
          pl.isMoving = true
          // Switch to run animation when moving
          if (pl.isOnGround && !pl.jumpState) {
            setPlayerSprite('player', 'run')
          }
        }
      })

      onKeyDown('right', () => {
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        if (blockRight) {
          pl.isMoving = false
          if (pl.isOnGround && !pl.jumpState) setPlayerSprite('player_idle', 'idle')
          return
        }
        {
          pl.move(pl.speed, 0)
          pl.facingRight = true
          pl.isMoving = true
          // Switch to run animation when moving
          if (pl.isOnGround && !pl.jumpState) {
            setPlayerSprite('player', 'run')
          }
        }
      })

      onKeyRelease('left', () => {
        const pl = get('player')[0]
        if (!pl) return
        pl.isMoving = false
        // Switch back to idle when not moving
        if (pl.isOnGround && !pl.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyRelease('right', () => {
        const pl = get('player')[0]
        if (!pl) return
        pl.isMoving = false
        // Switch back to idle when not moving
        if (pl.isOnGround && !pl.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      // Enhanced jump function
      function performJump() {
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        if (pl.jumpCount < pl.maxJumps) {
          pl.jumpCount++
          pl.jumpState = true
          pl.isOnGround = false
          
          // Play jump sound
          play('owl_jump', { volume: 0.3 })
          
          // Switch to jump sprite and play animation
          setPlayerSprite('player_jump', 'jump')
          
          // Apply jump force
          pl.jump(pl.jumpForce)
          
          // Reset to appropriate sprite after jump animation completes
          setTimeout(() => {
            const p2 = get('player')[0]
            if (!p2) return
            if (p2.isOnGround) {
              p2.jumpState = false
              // Switch back to idle or run based on movement state
              if (p2.isMoving) {
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
        const p: any = get('player')[0]
        if (!p || p.isDead) return
        if (p.isAttacking) return
        p.isAttacking = true
        
        // Play random hit sound
        playRandomHitSound()
        
        // set attack sprite, preserve facing
        p.use(sprite('player_attack'))
        p.play('attack')
        p.flipX = !p.facingRight
        // hitbox
        const dir = p.facingRight ? 1 : -1
        const hb = add([
          rect(36, 24),
          pos(p.pos.x + dir * 28, p.pos.y - 4),
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
          if (p.isOnGround) {
            if (p.isMoving) setPlayerSprite('player', 'run', true)
            else setPlayerSprite('player_idle', 'idle', true)
          } else {
            setPlayerSprite('player_jump', 'jump', true)
          }
        }, 520)
      }

      onKeyPress('space', () => { 
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        performJump() 
      })
      onKeyPress('x', () => {
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        performAttack()
      })

      // Arrow Up jump as well
      onKeyPress('up', () => { 
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        performJump() 
      })

      // Alternative controls
      onKeyDown('a', () => {
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        if (blockLeft) {
          pl.isMoving = false
          if (pl.isOnGround && !pl.jumpState) setPlayerSprite('player_idle', 'idle')
          return
        }
        {
          pl.move(-pl.speed, 0)
          pl.facingRight = false
          pl.isMoving = true
          // Switch to run animation when moving
          if (pl.isOnGround && !pl.jumpState) {
            setPlayerSprite('player', 'run')
          }
        }
      })

      onKeyDown('d', () => {
        const pl = get('player')[0]
        if (!pl || pl.isDead) return
        if (blockRight) {
          pl.isMoving = false
          if (pl.isOnGround && !pl.jumpState) setPlayerSprite('player_idle', 'idle')
          return
        }
        {
          pl.move(pl.speed, 0)
          pl.facingRight = true
          pl.isMoving = true
          // Switch to run animation when moving
          if (pl.isOnGround && !pl.jumpState) {
            setPlayerSprite('player', 'run')
          }
        }
      })

      onKeyRelease('a', () => {
        const pl = get('player')[0]
        if (!pl) return
        pl.isMoving = false
        // Switch back to idle when not moving
        if (pl.isOnGround && !pl.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyRelease('d', () => {
        const pl = get('player')[0]
        if (!pl) return
        pl.isMoving = false
        // Switch back to idle when not moving
        if (pl.isOnGround && !pl.jumpState) {
          setPlayerSprite('player_idle', 'idle')
        }
      })

      onKeyPress('w', () => {
        performJump()
      })

      // Collision detection
      const pl0 = get('player')[0]
      pl0?.onCollide('ground', () => {
        const pl = get('player')[0]
        if (!pl) return
        pl.isOnGround = true
        pl.jumpCount = 0
        pl.canDoubleJump = true
        
        // Switch back to appropriate sprite when landing
        if (pl.jumpState) {
          pl.jumpState = false
          // Switch back to idle or run based on movement state
          if (pl.isMoving) {
            setPlayerSprite('player', 'run')
          } else {
            setPlayerSprite('player_idle', 'idle')
          }
        }
      })

      // Coin collection handled inside coinSystem.makeCoin, but keep a guard for any stray coins
      pl0?.onCollide('coin', (c: any) => {
        // No-op, coinSystem already destroys & updates score
      })

      // UI with colors that match the background (use Pinia store)
      const scoreText = add([
        text(''),
        pos(20, 20),
        color(255, 255, 255),
        layer('ui'),
        fixed(),
        z(100),
      ])
      scoreText.text = `Score: ${game.score}`

      // Use lives from store
      lives = game.lives
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
      // keep cookie in sync + update score on coin changes
      saveCookie.value = { score: game.score, lives: game.lives, lastLevel: level }
      onScoreChanged((n: number) => {
        game.addScore(n - game.score)
        scoreText.text = `Score: ${game.score}`
        saveCookie.value = { score: game.score, lives: game.lives, lastLevel: level }
      })

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
        if (player.health <= 0 || player.isDead) return
        console.log(`⚔️ Applying damage: ${dmg}, Current HP: ${player.health}`)
        
        // Play hurt sound
        play('owl_hurt', { volume: 0.4 })
        
        // Update game store first
        game.damagePlayer(dmg)
        // Then sync local health with game store
        player.health = game.player.hp
        
        console.log(`💔 After damage: Local HP: ${player.health}, Game store HP: ${game.player.hp}`)
        // HP system reacts to Pinia store; no window hooks needed
        if (player.health <= 0) {
          console.log(`💀 Player died! Triggering death animation...`)
          // Play explosion sound
          play('owl_explosion', { volume: 0.5 })
          
          // Trigger death animation
          player.isDead = true
          setPlayerSprite('player_death', 'death', true)
          
          // Wait for death animation to complete before respawning
          setTimeout(() => {
            console.log(`🔄 Respawning player after death animation...`)
            game.loseLife()
            lives = game.lives
            livesText.text = `Lives: ${lives}`
            saveCookie.value = { score: game.score, lives: game.lives, lastLevel: level }
            if (lives <= 0) {
              go('gameOver', { level })
            } else {
              // Reset HP to full and restart same level with one fewer life
              game.respawnPlayer()
              go('game', { level, lives })
            }
          }, 2000) // Wait 2 seconds for death animation
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
            // Match player scale for consistency
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
          let skHp = add([
            rect(40, 6),
            pos(x - 20, y - 60),
            anchor('left'),
            color(0, 255, 0),
            layer('ui'),
            z(20),
          ])
          function updateSkHp() {
            const p = Math.max(0, Math.min(1, sk.health / sk.maxHealth))
            const w = Math.round(40 * p)
            
            let newColor
            if (p > 0.5) {
              newColor = color(0, 255, 0) // Green
              console.log(`🟢 Skeleton HP: ${sk.health}/${sk.maxHealth} (${(p*100).toFixed(1)}%) - Setting GREEN color`)
            } else if (p > 0.25) {
              newColor = color(255, 255, 0) // Yellow
              console.log(`🟡 Skeleton HP: ${sk.health}/${sk.maxHealth} (${(p*100).toFixed(1)}%) - Setting YELLOW color`)
            } else {
              newColor = color(255, 0, 0) // Red
              console.log(`🔴 Skeleton HP: ${sk.health}/${sk.maxHealth} (${(p*100).toFixed(1)}%) - Setting RED color`)
            }
            
            // Destroy old HP bar and create new one
            destroy(skHp)
            
            const uiX = Math.round(sk.pos.x)
            const uiY = Math.round(sk.pos.y - 60)
            
            // Create new HP bar with correct width and color
            const newSkHp = add([
              rect(w, 6),
              pos(uiX - 20, uiY),
              anchor('left'),
              newColor,
              layer('ui'),
              z(20),
            ])
            
            // Update the reference
            skHp = newSkHp
            
            console.log(`📊 Skeleton HP Bar - Width: ${w}/40, Color: ${newColor}, Percentage: ${(p*100).toFixed(1)}%`)
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
            if (skHp) {
              skHp.pos.x = uiX - 20; skHp.pos.y = uiY
            }

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

            // Enhanced chase / patrol with idle states
            const dx = player.pos.x - sk.pos.x
            const dist = Math.abs(dx)
            
            if (dist < 160 && !sk.isAttacking) {
              // chase player
              sk.direction = dx > 0 ? 1 : -1
              sk.flipX = sk.direction < 0
              sk.vel.x = sk.speed * sk.direction
              setSkAnim('walk')
            } else if (!sk.isAttacking) {
              // patrol behavior
              if (sk.pos.x <= sk.patrolStart) { 
                sk.direction = 1; 
                sk.flipX = false 
              }
              if (sk.pos.x >= sk.patrolEnd) { 
                sk.direction = -1; 
                sk.flipX = true 
              }
              
              // Add idle periods during patrol
              if (!sk.idleTimer) sk.idleTimer = 0
              if (!sk.isIdle) sk.isIdle = false
              
              if (sk.isIdle) {
                sk.vel.x = 0
                sk.idleTimer += 1/60 // Assuming 60 FPS
                setSkAnim('idle')
                if (sk.idleTimer > 120) { // Idle for ~2 seconds (120 frames at 60fps)
                  sk.isIdle = false
                  sk.idleTimer = 0
                }
              } else {
                sk.vel.x = sk.speed * sk.direction
                setSkAnim('walk')
                // Randomly go idle
                if (Math.random() < 0.002) { // 0.2% chance per frame
                  sk.isIdle = true
                  sk.idleTimer = 0
                }
              }
            }

            // attack if close
            if (dist < 80 && !sk.isAttacking) {
              sk.isAttacking = true
              sk.vel.x = 0
              setSkAnim('attack')
              const hit = add([
                rect(90, 50),
                pos(sk.pos.x + sk.direction * 45, sk.pos.y),
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
            console.log(`⚔️ Skeleton taking damage: ${sk.health} -> ${sk.health - 1}`)
            sk.health -= 1
            updateSkHp()
            setSkAnim('hit')
            if (sk.health <= 0) {
              console.log(`💀 Skeleton died!`)
              sk.isDead = true
              setSkAnim('dead')
              sk.vel.x = 0; sk.vel.y = 0
              destroy(skBg); destroy(skHp)
              setTimeout(() => destroy(sk), 1600)
            }
          })

          // Collision detection for walls/platforms - change direction when hitting obstacles
          let lastCollisionTime = 0
          sk.onCollide('ground', () => {
            if (sk.isDead) return
            const now = Date.now()
            if (now - lastCollisionTime < 500) return // Prevent rapid direction changes
            
            console.log(`🔄 Skeleton hit wall, changing direction from ${sk.direction} to ${-sk.direction}`)
            sk.direction = -sk.direction
            sk.flipX = sk.direction < 0
            lastCollisionTime = now
            
            // Move slightly away from the wall to prevent getting stuck
            sk.pos.x += sk.direction * 5
          })

          // Also detect collision with other enemies to prevent stacking
          sk.onCollide('enemy', (otherEnemy: any) => {
            if (sk.isDead || otherEnemy === sk) return
            const now = Date.now()
            if (now - lastCollisionTime < 500) return // Prevent rapid direction changes
            
            console.log(`🔄 Skeleton hit another enemy, changing direction`)
            sk.direction = -sk.direction
            sk.flipX = sk.direction < 0
            lastCollisionTime = now
            
            // Move slightly away from the other enemy
            sk.pos.x += sk.direction * 5
          })

          return sk
        }

        createSkeleton(400, 500)
        createSkeleton(800, 500)
        createSkeleton(1200, 500)
      }

      // Camera follow (x only), keep background fixed
      onUpdate(() => {
        const pl = get('player')[0]
        if (!pl) return
        let targetX = pl.pos.x
        const half = width() / 2
        if (targetX < half) targetX = half
        if (targetX > chosen.width - half) targetX = chosen.width - half
        setCamPos(targetX, height() / 2)
      })

      // Win condition
      pl0?.onCollide('goal', () => {
        // Save progress on level finish
        saveCookie.value = { score: game.score, lives, lastLevel: level }
        go('win')
      })

      // Coin/music handled by GameScene now
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

      // Quick numeric selection: press 0-9 to start that level directly
      const startLevel = (n: number) => {
        const livesInit = (saveCookie.value?.lives ?? 3)
        go('game', { level: n, lives: livesInit })
      }
      onKeyPress('0', () => startLevel(0))
      onKeyPress('1', () => startLevel(1))
      onKeyPress('2', () => startLevel(2))
      onKeyPress('3', () => startLevel(3))
      onKeyPress('4', () => startLevel(4))
      onKeyPress('5', () => startLevel(5))
      onKeyPress('6', () => startLevel(6))
      onKeyPress('7', () => startLevel(7))
      onKeyPress('8', () => startLevel(8))
      onKeyPress('9', () => startLevel(9))
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

      // Numeric keys 0-9 to open that level directly from level selection
      const startLevel = (n: number) => {
        const livesInit = (saveCookie.value?.lives ?? 3)
        go('game', { level: n, lives: livesInit })
      }
      onKeyPress('0', () => startLevel(0))
      onKeyPress('1', () => startLevel(1))
      onKeyPress('2', () => startLevel(2))
      onKeyPress('3', () => startLevel(3))
      onKeyPress('4', () => startLevel(4))
      onKeyPress('5', () => startLevel(5))
      onKeyPress('6', () => startLevel(6))
      onKeyPress('7', () => startLevel(7))
      onKeyPress('8', () => startLevel(8))
      onKeyPress('9', () => startLevel(9))
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
