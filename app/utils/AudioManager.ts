// Centralized Audio Manager for Kaplay
// Handles all music and sound effects with proper handle management

export class AudioManager {
  private gameInstance: any = null
  private currentMusic: any = null
  private soundEffects: Map<string, any> = new Map()

  // Initialize with Kaplay instance
  init(gameInstance: any) {
    this.gameInstance = gameInstance
    console.log('🎵 AudioManager initialized with game instance')
  }

  // Play music with proper handle management
  playMusic(soundName: string, options: { loop?: boolean; volume?: number } = {}) {
    if (!this.gameInstance) {
      console.warn('🎵 AudioManager not initialized')
      return null
    }

    try {
      // Stop current music first
      this.stopCurrentMusic()

      // Play new music and store handle
      const { play } = this.gameInstance
      const musicHandle = play(soundName, {
        loop: options.loop ?? true,
        volume: options.volume ?? 0.6
      })

      this.currentMusic = musicHandle
      console.log(`🎵 Started music: ${soundName}`, musicHandle)
      return musicHandle
    } catch (error) {
      console.error(`🎵 Failed to play music ${soundName}:`, error)
      return null
    }
  }

  // Stop current music properly
  stopCurrentMusic() {
    if (this.currentMusic && typeof this.currentMusic.stop === 'function') {
      try {
        console.log('🎵 Stopping current music:', this.currentMusic)
        this.currentMusic.stop()
        this.currentMusic = null
        console.log('✅ Current music stopped successfully')
      } catch (error) {
        console.error('❌ Failed to stop current music:', error)
      }
    } else if (this.currentMusic) {
      console.log('❌ Current music handle has no stop() method:', this.currentMusic)
      this.currentMusic = null
    }
  }

  // Play sound effect
  playSound(soundName: string, options: { volume?: number } = {}) {
    if (!this.gameInstance) {
      console.warn('🎵 AudioManager not initialized')
      return null
    }

    try {
      const { play } = this.gameInstance
      const soundHandle = play(soundName, {
        loop: false,
        volume: options.volume ?? 0.5
      })

      // Store sound effect handle for potential stopping
      this.soundEffects.set(soundName, soundHandle)
      console.log(`🎵 Played sound effect: ${soundName}`, soundHandle)
      return soundHandle
    } catch (error) {
      console.error(`🎵 Failed to play sound ${soundName}:`, error)
      return null
    }
  }

  // Stop specific sound effect
  stopSound(soundName: string) {
    const soundHandle = this.soundEffects.get(soundName)
    if (soundHandle && typeof soundHandle.stop === 'function') {
      try {
        soundHandle.stop()
        this.soundEffects.delete(soundName)
        console.log(`🎵 Stopped sound effect: ${soundName}`)
      } catch (error) {
        console.error(`🎵 Failed to stop sound ${soundName}:`, error)
      }
    }
  }

  // Stop all audio (nuclear option as fallback)
  stopAllAudio() {
    console.log('🎵 NUCLEAR OPTION: Stopping ALL audio...')
    
    // Stop current music
    this.stopCurrentMusic()

    // Stop all sound effects
    this.soundEffects.forEach((handle, name) => {
      if (handle && typeof handle.stop === 'function') {
        try {
          handle.stop()
          console.log(`🎵 Stopped sound effect: ${name}`)
        } catch (error) {
          console.error(`🎵 Failed to stop sound ${name}:`, error)
        }
      }
    })
    this.soundEffects.clear()

    // Stop all HTML5 audio elements as fallback
    try {
      const audioElements = document.querySelectorAll('audio')
      audioElements.forEach(audio => {
        console.log('🎵 Stopping HTML5 audio element:', audio)
        audio.pause()
        audio.currentTime = 0
      })
    } catch (error) {
      console.warn('❌ Failed to stop HTML5 audio elements:', error)
    }
  }

  // Get current music handle
  getCurrentMusic() {
    return this.currentMusic
  }

  // Check if music is playing
  isMusicPlaying() {
    return this.currentMusic !== null
  }
}

// Global instance
export const audioManager = new AudioManager()
