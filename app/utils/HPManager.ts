import { useGameStore } from '@/stores/game'
import { audioManager } from './AudioManager'

export interface HPBarConfig {
  width?: number
  height?: number
  offsetY?: number
  zIndex?: number
}

export interface DamageConfig {
  amount: number
  playSound?: boolean
  soundVolume?: number
  triggerDeath?: boolean
}

export class HPManager {
  private game: any = null
  private hpBar: any = null
  private hpBarBg: any = null
  private hpColorState: 'g' | 'y' | 'r' = 'g'
  private regenTimer = 0

  
  // Default configuration
  private config: HPBarConfig = {
    width: 40,
    height: 6,
    offsetY: -60,
    zIndex: 200
  }

  constructor(config?: Partial<HPBarConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
  }

  private getGame() {
    if (!this.game) {
      this.game = useGameStore()
    }
    return this.game
  }

  /**
   * Apply damage to the player
   */
  applyDamage(dmg: number, options: Partial<DamageConfig> = {}): boolean {
    const {
      playSound = true,
      soundVolume = 0.4,
      triggerDeath = true
    } = options

    const game = this.getGame()

    // Check if player can take damage
    if (game.player.hp <= 0 || game.isPlayerDead || !game.canTakeDamage) {
      return false
    }

    console.log(`⚔️ Applying damage: ${dmg}, Current HP: ${game.player.hp}`)
    
    // Play hurt sound
    if (playSound) {
      // Note: We'll need to access the play function from the game context
      // This will be handled by the game scene
    }
    
    // Update game store
    game.damagePlayer(dmg)
    
    console.log(`💔 After damage: HP: ${game.player.hp}/${game.player.maxHp}`)
    
    // Update HP bar
    this.updateHPBar()
    
    // Handle death
    if (game.player.hp <= 0 && triggerDeath) {
      this.handlePlayerDeath()
    }
    
    return true
  }

  /**
   * Heal the player
   */
  healPlayer(amount: number): boolean {
    const game = this.getGame()
    
    if (game.player.hp >= game.player.maxHp) {
      return false
    }

    console.log(`💚 Healing player: +${amount}, HP: ${game.player.hp}/${game.player.maxHp}`)
    
    game.healPlayer(amount)
    this.updateHPBar()
    
    return true
  }

  /**
   * Create HP bar UI
   */
  createHPBar(player: any, add: Function, rect: Function, pos: Function, anchor: Function, color: Function, layer: Function, z: Function, destroy: Function) {
    if (!player) return

    // Background
    this.hpBarBg = add([
      rect(this.config.width! + 2, this.config.height! + 2),
      pos(player.pos.x, player.pos.y + this.config.offsetY!),
      anchor('center'),
      color(0, 0, 0),
      layer('ui'),
      z(this.config.zIndex!),
    ])

    // Foreground bar
    this.hpBar = add([
      rect(this.config.width!, this.config.height!),
      pos(player.pos.x - this.config.width! / 2, player.pos.y + this.config.offsetY!),
      anchor('left'),
      color(0, 255, 0),
      layer('ui'),
      z(this.config.zIndex! + 1),
    ])

    this.updateHPBar()
    return { hpBar: this.hpBar, hpBarBg: this.hpBarBg }
  }

  /**
   * Update HP bar display
   */
  updateHPBar(): void {
    if (!this.hpBar || !this.hpBarBg) return

    const game = this.getGame()
    const pct = Math.max(0, Math.min(1, game.player.hp / game.player.maxHp))
    const w = game.player.hp <= 0 ? 0 : Math.floor(this.config.width! * pct)

    // Determine color bucket
    const state: 'g' | 'y' | 'r' = pct > 0.6 ? 'g' : pct > 0.3 ? 'y' : 'r'
    const clr = state === 'g' ? [0, 255, 0] : state === 'y' ? [255, 255, 0] : [255, 0, 0]

    // Update color if changed
    if (state !== this.hpColorState) {
      this.hpBar.color = clr
      this.hpColorState = state
    }

    // Update width
    this.hpBar.width = w

    console.log(`[HP] Bar update: hp=${game.player.hp}/${game.player.maxHp}, pct=${(pct*100).toFixed(1)}%, width=${w}/${this.config.width}`)
  }

  /**
   * Update HP bar position to follow player
   */
  updateHPBarPosition(player: any): void {
    if (!this.hpBar || !this.hpBarBg || !player) return

    const x = Math.round(player.pos.x)
    const y = Math.round(player.pos.y + this.config.offsetY!)

    // Background stays centered
    this.hpBarBg.pos.x = x
    this.hpBarBg.pos.y = y

    // Foreground begins at the left edge of the bg
    this.hpBar.pos.x = x - this.config.width! / 2
    this.hpBar.pos.y = y
  }

  /**
   * Handle regeneration logic
   */
  updateRegeneration(dt: number, player: any): void {
    // Do not regen during death animation
    if ((player as any).isDead) return

    const game = this.getGame()
    const now = Date.now()
    const msSinceDamage = now - game.lastDamageAt

    // Regen after no damage for 5s, then 1 HP every 2s
    if (msSinceDamage > 5000 && game.player.hp < game.player.maxHp) {
      this.regenTimer += dt
      if (this.regenTimer >= 2) {
        this.healPlayer(1)
        this.regenTimer = 0
      }
    } else {
      // Reset the regen timer while taking damage window is active
      this.regenTimer = 0
    }
  }

  /**
   * Handle player death
   */
  handlePlayerDeath(): void {
    const game = this.getGame()
    
    if (game.isPlayerDead) return

    console.log(`💀 Player died! Triggering death animation...`)
    game.setPlayerDead(true)

    // Play explosion sound
    // Note: This will be handled by the game scene

    // The actual death logic (lives, respawn, etc.) will be handled by the game scene
    // This method just marks the player as dead
  }

  /**
   * Reset player state (for respawn)
   */
  respawnPlayer(): void {
    const game = this.getGame()
    game.respawnPlayer()
    this.regenTimer = 0
    this.updateHPBar()
  }

  /**
   * Get current HP percentage
   */
  getHPPercentage(): number {
    const game = this.getGame()
    return game.player.hp / game.player.maxHp
  }

  /**
   * Get current HP bucket (green/yellow/red)
   */
  getHPBucket(): 'g' | 'y' | 'r' {
    const game = this.getGame()
    return game.hpBucket
  }

  /**
   * Check if player is dead
   */
  isPlayerDead(): boolean {
    const game = this.getGame()
    return game.isPlayerDeadComputed
  }

  /**
   * Check if regeneration is ready
   */
  isRegenReady(): boolean {
    const game = this.getGame()
    return game.isRegenReady()
  }

  /**
   * Get regeneration cooldown
   */
  getRegenCooldown(): number {
    const game = this.getGame()
    return game.regenCooldownMs()
  }

  /**
   * Destroy HP bar UI
   */
  destroyHPBar(): void {
    if (this.hpBar) {
      // Note: destroy function will be provided by the game context
      this.hpBar = null
    }
    if (this.hpBarBg) {
      this.hpBarBg = null
    }
  }
}

// Export a singleton instance
export const hpManager = new HPManager()
