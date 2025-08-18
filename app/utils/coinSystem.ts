// Coin system for Kaplay.js (Kaboom API)
// Provides animated coin sprite, SFX, spawning helpers, and score tracking
// NOTE: This module is context-agnostic. Call initCoinSystem(k) once with your Kaplay ctx.

let K: any = null
let coinSfxReady = false

export function initCoinSystem(ctx: any) {
  K = ctx
}

function generateCoinBeepWavUrl(): string {
  const sampleRate = 44100
  const durationSec = 0.12
  const numSamples = Math.floor(sampleRate * durationSec)
  const frequencyHz = 880
  const volume = 0.18
  const numChannels = 1
  const bitsPerSample = 16

  const dataSize = numSamples * numChannels * (bitsPerSample / 8)
  const buffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(buffer)

  // RIFF header
  let offset = 0
  function writeString(str: string) {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i))
    offset += str.length
  }
  function writeUint32LE(val: number) {
    view.setUint32(offset, val, true)
    offset += 4
  }
  function writeUint16LE(val: number) {
    view.setUint16(offset, val, true)
    offset += 2
  }

  writeString('RIFF')
  writeUint32LE(36 + dataSize)
  writeString('WAVE')
  writeString('fmt ')
  writeUint32LE(16) // Subchunk1Size (PCM)
  writeUint16LE(1)  // AudioFormat (Linear PCM)
  writeUint16LE(numChannels)
  writeUint32LE(sampleRate)
  writeUint32LE(sampleRate * numChannels * (bitsPerSample / 8))
  writeUint16LE(numChannels * (bitsPerSample / 8))
  writeUint16LE(bitsPerSample)
  writeString('data')
  writeUint32LE(dataSize)

  // Sine wave data
  const amplitude = Math.floor(32767 * volume)
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate
    const sample = Math.sin(2 * Math.PI * frequencyHz * t)
    view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * amplitude, true)
  }

  const blob = new Blob([buffer], { type: 'audio/wav' })
  return URL.createObjectURL(blob)
}

let currentScore = 0
const scoreListeners: Array<(n: number) => void> = []

export function getScore(): number {
  return currentScore
}

export function setScore(value: number) {
  currentScore = Math.max(0, Math.floor(value || 0))
  notifyScore()
}

export function initScore(value: number) {
  currentScore = Math.max(0, Math.floor(value || 0))
  // Don't notify listeners on init, just set the internal state
}

export function onScoreChanged(listener: (n: number) => void) {
  scoreListeners.push(listener)
}

function notifyScore() {
  for (const cb of scoreListeners) cb(currentScore)
}

// Load sprites and sounds used by coins (and lobby music)
export async function loadCoinAssets() {
  const coinUrl = new URL('../assets/sprites/items/coin.png', import.meta.url).href
  const lobbyUrl = new URL('../assets/music/lobby_1.wav', import.meta.url).href
  const coinWavUrl = new URL('../assets/sounds/items/coin.wav', import.meta.url).href

  // Animated coin: 10 frames @ 12 FPS, loop
  await K.loadSprite('coin', coinUrl, {
    sliceX: 10,
    sliceY: 1,
    anims: {
      spin: { from: 0, to: 9, speed: 12, loop: true },
    },
  })

  // Sounds: prefer external WAV coin, fallback to tiny generated WAV if not supported
  try {
    await K.loadSound('coin', coinWavUrl)
    coinSfxReady = true
  } catch {
    try {
      const coinBeepUrl = generateCoinBeepWavUrl()
      await K.loadSound('coin', coinBeepUrl)
      coinSfxReady = true
    } catch {
      coinSfxReady = false
    }
  }
  K.loadSound('lobby', lobbyUrl)
}

// Optional: start lobby music (loop)
export function playLobbyMusic(volume: number = 0.5) {
  if (!K) {
    console.warn('Kaplay context not available for lobby music')
    return null
  }
  try {
    const h = K.play('lobby', { loop: true, volume })
    return h
  } catch (error) {
    console.warn('Failed to play lobby music:', error)
    return null
  }
}

// Fade in music over time
export function fadeInMusic(musicHandle: any, targetVolume: number = 0.6, duration: number = 1000) {
  if (!musicHandle || !K) return
  
  const steps = 20
  const stepDuration = duration / steps
  const volumeStep = targetVolume / steps
  
  let currentStep = 0
  const fadeInterval = setInterval(() => {
    currentStep++
    const newVolume = Math.min(targetVolume, volumeStep * currentStep)
    
    try {
      if (musicHandle && typeof musicHandle.volume !== 'undefined') {
        musicHandle.volume = newVolume
      }
    } catch (error) {
      console.warn('Failed to adjust music volume:', error)
    }
    
    if (currentStep >= steps || newVolume >= targetVolume) {
      clearInterval(fadeInterval)
    }
  }, stepDuration)
}

// Force stop all music
export function stopAllMusic() {
  if (!K) return
  
  try {
    console.log('🎵 stopAllMusic: Trying to stop all sounds...')
    // Try to stop all playing sounds
    if (typeof K.stopAll === 'function') {
      console.log('🎵 stopAllMusic: Calling K.stopAll()')
      K.stopAll()
    }
    // Alternative: try to stop specific sounds
    if (typeof K.stop === 'function') {
      console.log('🎵 stopAllMusic: Stopping specific sounds')
      K.stop('start')
      K.stop('lobby')
    }
    // Try to access the audio context
    if (K.audio && typeof K.audio.stopAll === 'function') {
      console.log('🎵 stopAllMusic: Calling K.audio.stopAll()')
      K.audio.stopAll()
    }
    // Try to access the sound manager
    if (K.sound && typeof K.sound.stopAll === 'function') {
      console.log('🎵 stopAllMusic: Calling K.sound.stopAll()')
      K.sound.stopAll()
    }
  } catch (error) {
    console.warn('❌ stopAllMusic failed:', error)
  }
}

// Start music for menu/selection screens
export function playStartMusic(volume: number = 0.5) {
  if (!K) {
    console.warn('Kaplay context not available for start music')
    return null
  }
  try {
    const h = K.play('start', { loop: true, volume })
    return h
  } catch (error) {
    console.warn('Failed to play start music:', error)
    return null
  }
}

// Fade out music over time
export function fadeOutMusic(musicHandle: any, duration: number = 1000) {
  if (!musicHandle || !K) return
  
  const startVolume = musicHandle.volume || 0.6
  const steps = 20
  const stepDuration = duration / steps
  const volumeStep = startVolume / steps
  
  let currentStep = 0
  const fadeInterval = setInterval(() => {
    currentStep++
    const newVolume = Math.max(0, startVolume - (volumeStep * currentStep))
    
    try {
      if (musicHandle && typeof musicHandle.volume !== 'undefined') {
        musicHandle.volume = newVolume
      }
    } catch (error) {
      console.warn('Failed to adjust music volume:', error)
    }
    
    if (currentStep >= steps || newVolume <= 0) {
      clearInterval(fadeInterval)
      try {
        // Try multiple ways to stop the music
        if (musicHandle && typeof musicHandle.pause === 'function') {
          musicHandle.pause()
        }
        if (musicHandle && typeof musicHandle.stop === 'function') {
          musicHandle.stop()
        }
        // Force stop by setting volume to 0 and pausing
        if (musicHandle && typeof musicHandle.volume !== 'undefined') {
          musicHandle.volume = 0
        }
        if (musicHandle && typeof musicHandle.pause === 'function') {
          musicHandle.pause()
        }
      } catch (error) {
        console.warn('Failed to stop music after fade:', error)
      }
    }
  }, stepDuration)
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
    if (coinSfxReady) {
      try { K.play('coin', { volume: 0.18 }) } catch {}
    }
    // Kaplay context may not expose destroy on K; prefer entity.destroy()
    try {
      if (typeof K.destroy === 'function') K.destroy(coin)
      else if (typeof (coin as any).destroy === 'function') (coin as any).destroy()
    } catch {}
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


