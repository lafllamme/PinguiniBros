import { useGameStore } from '@/stores/game'

export interface PlayerConfig {
  speed: number
  jumpForce: number
  maxJumps: number
}

export class PlayerController {
  private player: any
  private kaplayContext: any
  private game = useGameStore()
  private config: PlayerConfig
  private isDead = false
  private isAttacking = false
  private facingRight = true
  private isMoving = false
  private jumpState = false
  private jumpCount = 0
  private isOnGround = false

  constructor(player: any, kaplayContext: any, config: PlayerConfig = {
    speed: 320,
    jumpForce: 640,
    maxJumps: 2
  }) {
    this.player = player
    this.kaplayContext = kaplayContext
    this.config = config
    this.setupPlayer()
  }

  private setupPlayer() {
    // Set up player physics
    this.player.onCollide('ground', () => {
      this.isOnGround = true
      this.jumpCount = 0
      this.jumpState = false
      this.updateSprite()
    })

    this.player.onCollideEnd('ground', () => {
      this.isOnGround = false
    })

    // Set up player controls
    this.setupControls()
  }

  private setupControls() {
    const { onKeyDown, onKeyPress, onKeyRelease } = this.kaplayContext

    // Movement controls
    onKeyDown('left', () => this.moveLeft())
    onKeyDown('right', () => this.moveRight())
    onKeyDown('a', () => this.moveLeft())
    onKeyDown('d', () => this.moveRight())

    onKeyRelease('left', () => this.stopMoving())
    onKeyRelease('right', () => this.stopMoving())
    onKeyRelease('a', () => this.stopMoving())
    onKeyRelease('d', () => this.stopMoving())

    // Jump controls
    onKeyPress('space', () => this.jump())
    onKeyPress('up', () => this.jump())
    onKeyPress('w', () => this.jump())

    // Attack control
    onKeyPress('x', () => this.attack())
  }

  public moveLeft() {
    if (this.isDead) return
    this.player.move(-this.config.speed, 0)
    this.facingRight = false
    this.isMoving = true
    this.updateSprite()
  }

  public moveRight() {
    if (this.isDead) return
    this.player.move(this.config.speed, 0)
    this.facingRight = true
    this.isMoving = true
    this.updateSprite()
  }

  public stopMoving() {
    this.isMoving = false
    this.updateSprite()
  }

  public jump() {
    if (this.isDead || this.jumpCount >= this.config.maxJumps) return
    
    this.jumpCount++
    this.jumpState = true
    this.isOnGround = false
    
          // Play jump sound
      this.kaplayContext.play('owl_jump', { volume: 0.15 })
    
    // Apply jump force
    this.player.jump(this.config.jumpForce)
    
    // Update sprite
    this.updateSprite()
    
    // Reset jump state after animation
    setTimeout(() => {
      if (this.isOnGround) {
        this.jumpState = false
        this.updateSprite()
      }
    }, 800)
  }

  public attack() {
    if (this.isDead || this.isAttacking) return
    
    this.isAttacking = true
    
    // Play random hit sound
    this.playRandomHitSound()
    
    // Set attack sprite
    this.updateSprite()
    
    // Create attack hitbox
    this.createAttackHitbox()
    
    // Reset attack state
    setTimeout(() => {
      this.isAttacking = false
      this.updateSprite()
    }, 520)
  }

  private playRandomHitSound() {
    const hitSounds = [
      'owl_hit_1', 'owl_hit_2', 'owl_hit_3', 'owl_hit_4', 'owl_hit_5', 'owl_hit_6',
      'owl_hit_7', 'owl_hit_8', 'owl_hit_9', 'owl_hit_10', 'owl_hit_11', 'owl_hit_12'
    ]
    const randomSound = hitSounds[Math.floor(Math.random() * hitSounds.length)]
    this.kaplayContext.play(randomSound, { volume: 0.3 })
  }

  private createAttackHitbox() {
    const { add, rect, pos, anchor, area, layer, z, opacity, lifespan } = this.kaplayContext
    
    const dir = this.facingRight ? 1 : -1
    const hitbox = add([
      rect(36, 24),
      pos(this.player.pos.x + dir * 28, this.player.pos.y - 4),
      anchor('center'),
      area(),
      layer('game'),
      z(15),
      opacity(0),
      'playerAttack',
      lifespan(0.25, { fade: 0 })
    ])
    
    hitbox.onCollide('skeleton', (sk: any) => {
      sk.trigger?.('playerAttack')
    })
  }

  private updateSprite() {
    if (this.isDead) {
      this.setSprite('player_death', 'death')
      return
    }
    
    if (this.isAttacking) {
      this.setSprite('player_attack', 'attack')
      return
    }
    
    if (this.jumpState) {
      this.setSprite('player_jump', 'jump')
      return
    }
    
    if (this.isMoving && this.isOnGround) {
      this.setSprite('player', 'run')
      return
    }
    
    this.setSprite('player_idle', 'idle')
  }

  private setSprite(spriteName: string, animationName: string) {
    this.player.use(this.kaplayContext.sprite(spriteName))
    this.player.play(animationName)
    this.player.flipX = !this.facingRight
  }

  public takeDamage(amount: number) {
    if (this.isDead) return
    
    // Play hurt sound
    this.kaplayContext.play('owl_hurt', { volume: 0.4 })
    
    // Update game store
    this.game.damagePlayer(amount)
    
    if (this.game.player.hp <= 0) {
      this.die()
    }
  }

  private die() {
    this.isDead = true
    
    // Play explosion sound
    this.kaplayContext.play('owl_explosion', { volume: 0.5 })
    
    // Set death sprite
    this.setSprite('player_death', 'death')
    
    // Trigger game over after animation
    setTimeout(() => {
      this.game.loseLife()
      if (this.game.lives <= 0) {
        this.kaplayContext.go('gameOver', { level: this.game.currentLevel })
      } else {
        this.kaplayContext.go('game', { level: this.game.currentLevel, lives: this.game.lives })
      }
    }, 2000)
  }

  public getPosition() {
    return this.player.pos
  }

  public isGrounded() {
    return this.isOnGround
  }

  public getHealth() {
    return this.game.player.hp
  }

  public getMaxHealth() {
    return this.game.player.maxHp
  }

  public onGroundCollide() {
    this.isOnGround = true
    this.jumpCount = 0
    this.jumpState = false
    this.updateSprite()
  }
}
