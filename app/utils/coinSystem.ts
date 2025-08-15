// Coin system for Kaplay.js (Kaboom API)
// Provides animated coin sprite, SFX, spawning helpers, and score tracking
// NOTE: This module is context-agnostic. Call initCoinSystem(k) once with your Kaplay ctx.

let K: any = null

export function initCoinSystem(ctx: any) {
  K = ctx
}

let currentScore = 0
const scoreListeners: Array<(n: number) => void> = []

export function getScore(): number {
  return currentScore
}

export function onScoreChanged(listener: (n: number) => void) {
  scoreListeners.push(listener)
}

function notifyScore() {
  for (const cb of scoreListeners) cb(currentScore)
}

// Load sprites and sounds used by coins (and lobby music)
export async function loadCoinAssets() {
  const coinUrl = new URL('../assets/sprites/coin.png', import.meta.url).href
  const lobbyUrl = new URL('../assets/sounds/lobby.ogg', import.meta.url).href

  // Animated coin: 10 frames @ 12 FPS, loop
  await K.loadSprite('coin', coinUrl, {
    sliceX: 10,
    sliceY: 1,
    anims: {
      spin: { from: 0, to: 9, speed: 12, loop: true },
    },
  })

  // Sounds
  K.loadSound('lobby', lobbyUrl)
}

// Optional: start lobby music (loop)
export function playLobbyMusic(volume: number = 0.5) {
  const h = K.play('lobby', { loop: true, volume })
  return h
}

type Vec2Like = { x: number; y: number }

export interface MakeCoinOpts {
  falling?: boolean
}

export function makeCoin(position: Vec2Like, opts: MakeCoinOpts = {}) {
  const isFalling = !!opts.falling

  const coin = K.add([
    K.sprite('coin'),
    K.pos(position.x, position.y),
    K.anchor('center'),
    // Use default rect collider (circle not supported in your build)
    K.area(),
    isFalling ? K.body() : K.body({ isStatic: true }),
    K.z(100),
    'coin',
  ])

  // Start animation
  ;(coin as any).play?.('spin')

  // Guard against double collect
  ;(coin as any)._collected = false

  coin.onCollide('player', () => {
    if ((coin as any)._collected) return
    ;(coin as any)._collected = true
    currentScore += 1
    notifyScore()
    K.play('coin')
    K.destroy(coin)
  })

  return coin
}

export interface Bounds {
  x: number
  y: number
  w: number
  h: number
}

export interface SpawnOpts {
  falling?: boolean
}

export function spawnCoinsRandom(count: number, worldBounds: Bounds, opts: SpawnOpts = {}) {
  const coins: any[] = []
  const { falling = false } = opts

  for (let i = 0; i < count; i++) {
    const x = worldBounds.x + K.rand(0, worldBounds.w)
    let y: number

    if (falling) {
      // Spawn slightly above viewport (or top of bounds)
      y = worldBounds.y - 50
    } else {
      // Scatter near ground band inside bounds
      const minY = worldBounds.y + Math.max(120, worldBounds.h * 0.3)
      const maxY = worldBounds.y + worldBounds.h - 120
      y = K.rand(minY, maxY)
    }

    coins.push(makeCoin({ x, y }, { falling }))
  }

  return coins
}


