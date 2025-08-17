// Centralized asset loader for Kaplay
// Loads all sprites, sounds, and music before scenes start

export type KaplayLike = {
  loadSprite: (...args: any[]) => Promise<any> | void
  loadSound: (...args: any[]) => Promise<any> | void
}

let K: KaplayLike | null = null
let loaded = false



export function initAssetLoader(ctx: KaplayLike) {
  K = ctx
}

export async function loadAllAssets(): Promise<void> {
  if (!K) throw new Error('Kaplay context not set. Call initAssetLoader(K) first.')
  if (loaded) return

  const { loadSprite, loadSound } = K as any

  const spriteLoads: Array<Promise<any> | void> = []
  const soundLoads: Array<Promise<any> | void> = []

  // Player sprites with anims
  const playerRunUrl = new URL('../assets/sprites/characters/owl/run/6.png', import.meta.url).href
  spriteLoads.push(loadSprite('player', playerRunUrl, {
    sliceX: 6,
    sliceY: 1,
    anims: { run: { from: 0, to: 5, speed: 8, loop: true } },
  }))

  const playerIdleUrl = new URL('../assets/sprites/characters/owl/idle/4.png', import.meta.url).href
  spriteLoads.push(loadSprite('player_idle', playerIdleUrl, {
    sliceX: 4,
    sliceY: 1,
    anims: { idle: { from: 0, to: 3, speed: 6, loop: true } },
  }))

  const playerJumpUrl = new URL('../assets/sprites/characters/owl/jump/8.png', import.meta.url).href
  spriteLoads.push(loadSprite('player_jump', playerJumpUrl, {
    sliceX: 8,
    sliceY: 1,
    anims: { jump: { from: 0, to: 7, speed: 12, loop: false } },
  }))

  const playerAttackUrl = new URL('../assets/sprites/characters/owl/attack/6.png', import.meta.url).href
  spriteLoads.push(loadSprite('player_attack', playerAttackUrl, {
    sliceX: 6,
    sliceY: 1,
    anims: { attack: { from: 0, to: 5, speed: 12, loop: false } },
  }))

  const playerDeathUrl = new URL('../assets/sprites/characters/owl/death/8.png', import.meta.url).href
  spriteLoads.push(loadSprite('player_death', playerDeathUrl, {
    sliceX: 8,
    sliceY: 1,
    anims: { death: { from: 0, to: 7, speed: 8, loop: false } },
  }))

  // Enemy: skeleton spritesheet and anims
  try {
    const skeletonUrl = new URL('../assets/sprites/characters/skeleton/skeleton_enemy.png', import.meta.url).href
    spriteLoads.push(loadSprite('skeleton', skeletonUrl, {
      sliceX: 13,
      sliceY: 5,
      anims: {
        attack: { from: 0, to: 12, speed: 12, loop: false },
        dead: { from: 13, to: 25, speed: 8, loop: false },
        walk: { from: 26, to: 37, speed: 12, loop: true },
        idle: { from: 39, to: 42, speed: 8, loop: true },
        hit: { from: 52, to: 54, speed: 12, loop: false },
      },
    }))
  } catch {}

  // Backgrounds used by UI scenes (not level_bg alias)
  const phase1Url = new URL('../assets/sprites/general/phase1.png', import.meta.url).href
  const phase2Url = new URL('../assets/sprites/general/phase2.png', import.meta.url).href
  spriteLoads.push(loadSprite('phase1', phase1Url))
  spriteLoads.push(loadSprite('phase2', phase2Url))

  // Tiles1: 16x16 grid (256x256), tile size 16px
  try {
    const tiles1Url = new URL('../assets/sprites/general/tiles/tiles1.png', import.meta.url).href
    spriteLoads.push(loadSprite('tiles1', tiles1Url, {
      sliceX: 16,
      sliceY: 16,
    }))
  } catch {}
  
  // Door: 8 frames horizontally
  try {
    const doorUrl = new URL('../assets/sprites/general/doors/door_1_8.png', import.meta.url).href
    spriteLoads.push(loadSprite('door', doorUrl, {
      sliceX: 8,
      sliceY: 1,
      // Door: 8 frames, no animations needed - we'll control frames manually
    }))
  } catch {}

  // Basic placeholder items
  spriteLoads.push(loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
  spriteLoads.push(loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))
  spriteLoads.push(loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='))

  // Character sounds
  const sound = (p: string) => new URL(p, import.meta.url).href
  const hitNames = Array.from({ length: 12 }, (_, i) => `owl_hit_${i + 1}`)
  hitNames.forEach((n, i) => soundLoads.push(loadSound(n, sound(`../assets/sounds/character/owl/hits/${i + 1}.ogg`))))
  soundLoads.push(loadSound('owl_hurt', sound('../assets/sounds/character/owl/hurt.wav')))
  soundLoads.push(loadSound('owl_jump', sound('../assets/sounds/character/owl/jump.wav')))
  soundLoads.push(loadSound('owl_explosion', sound('../assets/sounds/character/owl/explosion.wav')))

  // Lobby music
  try {
    soundLoads.push(loadSound('lobby', sound('../assets/music/lobby_1.wav')))
  } catch {}

  await Promise.all([...spriteLoads, ...soundLoads])
  loaded = true
}

export function isLoaded(): boolean {
  return loaded
}


