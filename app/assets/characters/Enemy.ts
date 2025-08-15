import type { GameObj, Vec2 } from 'kaplay'

export interface EnemyConfig {
  speed: number
  health: number
  damage: number
  patrolDistance: number
  sprite: string
}

export enum EnemyType {
  SLIME = 'slime',
  BAT = 'bat',
  SPIKE = 'spike'
}

export class Enemy {
  private gameObj: GameObj
  private config: EnemyConfig
  private startPos: Vec2
  private patrolDirection: number = 1
  private isDead: boolean = false

  constructor(gameObj: GameObj, config: EnemyConfig) {
    this.gameObj = gameObj
    this.config = config
    this.startPos = gameObj.pos.clone()
    this.setupEnemy()
  }

  private setupEnemy() {
    // Set up enemy behavior
    this.gameObj.onCollide('player', () => {
      this.onPlayerCollision()
    })

    // Set up patrol movement
    this.setupPatrol()
  }

  private setupPatrol() {
    // Simple patrol behavior
    this.gameObj.onUpdate(() => {
      if (this.isDead) return

      const currentX = this.gameObj.pos.x
      const startX = this.startPos.x

      // Change direction when reaching patrol limits
      if (currentX <= startX - this.config.patrolDistance || 
          currentX >= startX + this.config.patrolDistance) {
        this.patrolDirection *= -1
        this.gameObj.flipX = this.patrolDirection < 0
      }

      // Move enemy
      this.gameObj.move(this.config.speed * this.patrolDirection, 0)
    })
  }

  private onPlayerCollision() {
    // Handle collision with player
    // This will be implemented in the game scene
  }

  public takeDamage(damage: number) {
    this.config.health -= damage
    if (this.config.health <= 0) {
      this.die()
    }
  }

  private die() {
    this.isDead = true
    // Add death animation or effects here
    destroy(this.gameObj)
  }

  public getPosition(): Vec2 {
    return this.gameObj.pos
  }

  public isAlive(): boolean {
    return !this.isDead
  }

  public getDamage(): number {
    return this.config.damage
  }
}

// Factory function to create different enemy types
export function createEnemy(type: EnemyType, pos: Vec2): EnemyConfig {
  switch (type) {
    case EnemyType.SLIME:
      return {
        speed: 50,
        health: 2,
        damage: 1,
        patrolDistance: 100,
        sprite: 'slime'
      }
    case EnemyType.BAT:
      return {
        speed: 80,
        health: 1,
        damage: 1,
        patrolDistance: 150,
        sprite: 'bat'
      }
    case EnemyType.SPIKE:
      return {
        speed: 0,
        health: 999, // Immortal
        damage: 2,
        patrolDistance: 0,
        sprite: 'spike'
      }
    default:
      return {
        speed: 50,
        health: 1,
        damage: 1,
        patrolDistance: 100,
        sprite: 'enemy'
      }
  }
}
