import { useGameStore } from '@/stores/game'
import { audioManager } from './AudioManager'

export interface HPBarConfig {
  width?: number
  height?: number
  offsetY?: number
  zIndex?: number
  target?: any // For enemy HP bars
  isEnemy?: boolean // Distinguish between player and enemy HP bars
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
  private target: any = null // For enemy HP bars
  private isEnemy: boolean = false
  private destroyFn: Function | null = null // Store destroy function

  
  // Default configuration
  private config: HPBarConfig = {
    width: 40,
    height: 6,
    offsetY: -60,
    zIndex: 200,
    isEnemy: false
  }

  // Color constants for HP bar
  private readonly HP_COLORS = {
    green: [0, 255, 0],
    yellow: [255, 255, 0], 
    red: [255, 0, 0]
  }

  constructor(config?: Partial<HPBarConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }
    this.isEnemy = this.config.isEnemy || false
    this.target = this.config.target || null
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
  createHPBar(target: any, add: Function, rect: Function, pos: Function, anchor: Function, color: Function, layer: Function, z: Function, destroy: Function) {
    if (!target) return

    // Store target reference and destroy function
    this.target = target
    this.destroyFn = destroy

    // Background
    this.hpBarBg = add([
      rect(this.config.width! + 2, this.config.height! + 2),
      pos(target.pos.x, target.pos.y + this.config.offsetY!),
      anchor('center'),
      color(0, 0, 0),
      layer('ui'),
      z(this.config.zIndex!),
    ])

    // Foreground bar - use left anchor for both player and enemies for consistent shrinking
    const barPos = pos(target.pos.x - this.config.width! / 2, target.pos.y + this.config.offsetY!)

    this.hpBar = add([
      rect(this.config.width!, this.config.height!),
      barPos,
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

    let pct: number
    let w: number
    let currentHp: number
    let maxHp: number

    if (this.isEnemy && this.target) {
      // Enemy HP bar
      currentHp = this.target.health || 0
      maxHp = this.target.maxHealth || 1
      pct = Math.max(0, Math.min(1, currentHp / maxHp))
      w = currentHp <= 0 ? 0 : Math.floor(this.config.width! * pct)
    } else {
      // Player HP bar
      const game = this.getGame()
      currentHp = game.player.hp
      maxHp = game.player.maxHp
      pct = Math.max(0, Math.min(1, currentHp / maxHp))
      w = currentHp <= 0 ? 0 : Math.floor(this.config.width! * pct)
    }

    // Determine color bucket
    const state: 'g' | 'y' | 'r' = pct > 0.6 ? 'g' : pct > 0.3 ? 'y' : 'r'
    
    // Get color based on state
    let colorArray: number[]
    switch (state) {
      case 'g':
        colorArray = this.HP_COLORS.green
        break
      case 'y':
        colorArray = this.HP_COLORS.yellow
        break
      case 'r':
        colorArray = this.HP_COLORS.red
        break
      default:
        colorArray = this.HP_COLORS.green
    }

    // Update color if changed
    if (state !== this.hpColorState) {
      // In Kaplay, we need to set the color as an array
      this.hpBar.color = colorArray
      this.hpColorState = state
      console.log(`[HP] Color changed to: ${state} (${colorArray.join(', ')})`)
    }

    // Update width
    this.hpBar.width = w

    const entityType = this.isEnemy ? 'Enemy' : 'Player'
    console.log(`[HP] ${entityType} Bar update: hp=${currentHp}/${maxHp}, pct=${(pct*100).toFixed(1)}%, width=${w}/${this.config.width}, state=${state}`)
  }

  /**
   * Update HP bar position to follow target
   */
  updateHPBarPosition(target: any): void {
    if (!this.hpBar || !this.hpBarBg || !target) return

    const x = Math.round(target.pos.x)
    const y = Math.round(target.pos.y + this.config.offsetY!)

    // Background stays centered
    this.hpBarBg.pos.x = x
    this.hpBarBg.pos.y = y

    // Foreground is left-anchored for both player and enemies
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
    if (this.hpBar && this.destroyFn) {
      this.destroyFn(this.hpBar)
      this.hpBar = null
    }
    if (this.hpBarBg && this.destroyFn) {
      this.destroyFn(this.hpBarBg)
      this.hpBarBg = null
    }
  }

  /**
   * Apply damage to enemy
   */
  damageEnemy(amount: number): boolean {
    if (!this.isEnemy || !this.target) return false

    console.log(`⚔️ Enemy taking damage: ${this.target.health} -> ${this.target.health - amount}`)
    
    this.target.health = Math.max(0, this.target.health - amount)
    this.updateHPBar()
    
    return true
  }

  /**
   * Check if enemy is dead
   */
  isEnemyDead(): boolean {
    if (!this.isEnemy || !this.target) return false
    return this.target.health <= 0
  }

  /**
   * Get enemy HP percentage
   */
  getEnemyHPPercentage(): number {
    if (!this.isEnemy || !this.target) return 0
    return this.target.health / this.target.maxHealth
  }
}

// Export a singleton instance
export const hpManager = new HPManager()
