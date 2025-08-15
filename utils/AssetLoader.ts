export interface AssetConfig {
  sprites: SpriteConfig[]
  sounds: SoundConfig[]
  music: MusicConfig[]
}

export interface SpriteConfig {
  name: string
  path: string
  width?: number
  height?: number
}

export interface SoundConfig {
  name: string
  path: string
  volume?: number
}

export interface MusicConfig {
  name: string
  path: string
  volume?: number
  loop?: boolean
}

export class AssetLoader {
  private static instance: AssetLoader
  private loadedAssets: Set<string> = new Set()
  private loadingPromises: Promise<void>[] = []

  private constructor() {}

  public static getInstance(): AssetLoader {
    if (!AssetLoader.instance) {
      AssetLoader.instance = new AssetLoader()
    }
    return AssetLoader.instance
  }

  public async loadAssets(config: AssetConfig): Promise<void> {
    console.log('🎮 Loading game assets...')

    // Load sprites
    for (const sprite of config.sprites) {
      this.loadingPromises.push(this.loadSprite(sprite))
    }

    // Load sounds
    for (const sound of config.sounds) {
      this.loadingPromises.push(this.loadSound(sound))
    }

    // Load music
    for (const music of config.music) {
      this.loadingPromises.push(this.loadMusic(music))
    }

    try {
      await Promise.all(this.loadingPromises)
      console.log('✅ All assets loaded successfully!')
    } catch (error) {
      console.error('❌ Error loading assets:', error)
      throw error
    }
  }

  private async loadSprite(config: SpriteConfig): Promise<void> {
    if (this.loadedAssets.has(`sprite_${config.name}`)) {
      return
    }

    try {
      // For now, we'll use placeholder data URLs
      // In a real game, you'd load actual sprite files
      const placeholderData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
      
      loadSprite(config.name, placeholderData)
      this.loadedAssets.add(`sprite_${config.name}`)
      
      console.log(`📷 Loaded sprite: ${config.name}`)
    } catch (error) {
      console.error(`❌ Failed to load sprite: ${config.name}`, error)
      throw error
    }
  }

  private async loadSound(config: SoundConfig): Promise<void> {
    if (this.loadedAssets.has(`sound_${config.name}`)) {
      return
    }

    try {
      // Placeholder sound data
      const placeholderData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
      
      loadSound(config.name, placeholderData)
      this.loadedAssets.add(`sound_${config.name}`)
      
      console.log(`🔊 Loaded sound: ${config.name}`)
    } catch (error) {
      console.error(`❌ Failed to load sound: ${config.name}`, error)
      throw error
    }
  }

  private async loadMusic(config: MusicConfig): Promise<void> {
    if (this.loadedAssets.has(`music_${config.name}`)) {
      return
    }

    try {
      // Placeholder music data
      const placeholderData = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
      
      loadSound(config.name, placeholderData)
      this.loadedAssets.add(`music_${config.name}`)
      
      console.log(`🎵 Loaded music: ${config.name}`)
    } catch (error) {
      console.error(`❌ Failed to load music: ${config.name}`, error)
      throw error
    }
  }

  public isAssetLoaded(type: 'sprite' | 'sound' | 'music', name: string): boolean {
    return this.loadedAssets.has(`${type}_${name}`)
  }

  public getLoadedAssetsCount(): number {
    return this.loadedAssets.size
  }

  public clearLoadedAssets(): void {
    this.loadedAssets.clear()
    this.loadingPromises = []
  }
}

// Default asset configuration for Pinguini Bros
export const defaultAssets: AssetConfig = {
  sprites: [
    { name: 'penguin', path: '/assets/sprites/penguin.png' },
    { name: 'ice_ground', path: '/assets/sprites/ice_ground.png' },
    { name: 'ice_platform', path: '/assets/sprites/ice_platform.png' },
    { name: 'fish', path: '/assets/sprites/fish.png' },
    { name: 'coin', path: '/assets/sprites/coin.png' },
    { name: 'gem', path: '/assets/sprites/gem.png' },
    { name: 'slime', path: '/assets/sprites/slime.png' },
    { name: 'bat', path: '/assets/sprites/bat.png' },
    { name: 'spike', path: '/assets/sprites/spike.png' },
    { name: 'goal', path: '/assets/sprites/goal.png' },
    { name: 'ice_cave', path: '/assets/sprites/ice_cave.png' },
    { name: 'snow_bg', path: '/assets/sprites/snow_bg.png' }
  ],
  sounds: [
    { name: 'jump', path: '/assets/sounds/jump.wav', volume: 0.7 },
    { name: 'collect', path: '/assets/sounds/collect.wav', volume: 0.8 },
    { name: 'hit', path: '/assets/sounds/hit.wav', volume: 0.6 },
    { name: 'death', path: '/assets/sounds/death.wav', volume: 0.5 },
    { name: 'level_complete', path: '/assets/sounds/level_complete.wav', volume: 0.8 }
  ],
  music: [
    { name: 'menu_music', path: '/assets/music/menu.mp3', volume: 0.4, loop: true },
    { name: 'game_music', path: '/assets/music/game.mp3', volume: 0.3, loop: true },
    { name: 'victory_music', path: '/assets/music/victory.mp3', volume: 0.5, loop: false }
  ]
}
