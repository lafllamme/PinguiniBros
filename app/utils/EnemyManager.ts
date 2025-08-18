import { HPManager } from './HPManager'

export interface EnemyConfig {
  health: number
  maxHealth: number
  speed: number
  patrolDistance: number
  attackRange: number
  chaseRange: number
}

export class EnemyManager {
  private kaplayContext: any
  private enemies: Map<any, any> = new Map() // enemy -> hpManager

  constructor(kaplayContext: any) {
    this.kaplayContext = kaplayContext
  }

  public createSkeleton(x: number, y: number, config: EnemyConfig = {
    health: 3,
    maxHealth: 3,
    speed: 80,
    patrolDistance: 100,
    attackRange: 80,
    chaseRange: 160
  }) {
    const { add, sprite, pos, anchor, scale, area, body, layer, z, rect, color, onUpdate, destroy } = this.kaplayContext

    const skeleton = add([
      sprite('skeleton'),
      pos(x, y),
      anchor('center'),
      scale(1.5),
      area({ width: 24, height: 48, offset: { x: 0, y: -22 } }),
      body(),
      layer('game'),
      z(5),
      'enemy',
      'skeleton',
      {
        health: config.health,
        maxHealth: config.maxHealth,
        speed: config.speed,
        direction: 1,
        isAttacking: false,
        isDead: false,
        patrolStart: x - config.patrolDistance,
        patrolEnd: x + config.patrolDistance,
        attackRange: config.attackRange,
        chaseRange: config.chaseRange,
        idleTimer: 0,
        isIdle: false
      }
    ])

    skeleton.play('idle')

    // Create HP bar using unified HPManager
    const hpManager = new HPManager({
      width: 40,
      height: 6,
      offsetY: -60,
      zIndex: 20,
      target: skeleton,
      isEnemy: true
    })

    const hpBarElements = hpManager.createHPBar(
      skeleton,
      add,
      rect,
      pos,
      anchor,
      color,
      layer,
      z,
      destroy
    )

    this.enemies.set(skeleton, hpManager)

    // Setup AI
    this.setupSkeletonAI(skeleton)

    // Setup collision handling
    this.setupSkeletonCollisions(skeleton, hpManager)

    return skeleton
  }

  private setupSkeletonAI(skeleton: any) {
    const { onUpdate, add, rect, pos, anchor, area, layer, z, opacity, lifespan, get } = this.kaplayContext

    onUpdate(() => {
      if (skeleton.isDead) return

      const player = get('player')[0]
      if (!player) return

      const dx = player.pos.x - skeleton.pos.x
      const dist = Math.abs(dx)

      // Chase player if in range
      if (dist < skeleton.chaseRange && !skeleton.isAttacking) {
        skeleton.direction = dx > 0 ? 1 : -1
        skeleton.flipX = skeleton.direction < 0
        skeleton.vel.x = skeleton.speed * skeleton.direction
        skeleton.play('walk')
      } else if (!skeleton.isAttacking) {
        // Patrol behavior
        this.handlePatrol(skeleton)
      }

      // Attack if close
      if (dist < skeleton.attackRange && !skeleton.isAttacking) {
        this.performAttack(skeleton, player)
      }
    })
  }

  private handlePatrol(skeleton: any) {
    // Change direction at patrol boundaries
    if (skeleton.pos.x <= skeleton.patrolStart) {
      skeleton.direction = 1
      skeleton.flipX = false
    }
    if (skeleton.pos.x >= skeleton.patrolEnd) {
      skeleton.direction = -1
      skeleton.flipX = true
    }

    // Add idle periods during patrol
    if (skeleton.isIdle) {
      skeleton.vel.x = 0
      skeleton.play('idle')
      skeleton.idleTimer += 1/60 // Assuming 60 FPS
      if (skeleton.idleTimer > 120) { // Idle for ~2 seconds
        skeleton.isIdle = false
        skeleton.idleTimer = 0
      }
    } else {
      skeleton.vel.x = skeleton.speed * skeleton.direction
      skeleton.play('walk')
      // Randomly go idle
      if (Math.random() < 0.002) { // 0.2% chance per frame
        skeleton.isIdle = true
        skeleton.idleTimer = 0
      }
    }
  }

  private performAttack(skeleton: any, player: any) {
    const { add, rect, pos, anchor, area, layer, z, opacity, lifespan } = this.kaplayContext
    
    skeleton.isAttacking = true
    skeleton.vel.x = 0
    skeleton.play('attack')

    const hitbox = add([
      rect(90, 50),
      pos(skeleton.pos.x + skeleton.direction * 45, skeleton.pos.y),
      anchor('center'),
      area(),
      layer('game'),
      z(10),
      opacity(0),
      'skeletonAttack',
      lifespan(0.35, { fade: 0 })
    ])

    // Damage player when overlapping this attack hitbox
    hitbox.onCollide('player', () => {
      // Apply damage to player - for now, we'll use the game store directly
      // In a real implementation, you'd get the player controller
      const { useGameStore } = require('@/stores/game')
      const game = useGameStore()
      game.damagePlayer(1)
    })

    setTimeout(() => {
      skeleton.isAttacking = false
      if (!skeleton.isDead) skeleton.play('walk')
    }, 700)
  }

  private setupSkeletonCollisions(skeleton: any, hpManager: any) {
    const { onUpdate, destroy } = this.kaplayContext

    // When hit by player attack
    skeleton.onCollide('playerAttack', () => {
      if (skeleton.isDead) return
      
      skeleton.health -= 1
      skeleton.play('hit')
      
      if (skeleton.health <= 0) {
        skeleton.isDead = true
        skeleton.play('dead')
        skeleton.vel.x = 0
        skeleton.vel.y = 0
        
        // HP bar will be automatically hidden by updateHPBar when health reaches 0
        this.enemies.delete(skeleton)
        
        // Destroy skeleton after animation
        setTimeout(() => destroy(skeleton), 1600)
      }
    })

    // Collision detection for walls/platforms
    let lastCollisionTime = 0
    skeleton.onCollide('ground', () => {
      if (skeleton.isDead) return
      const now = Date.now()
      if (now - lastCollisionTime < 500) return // Prevent rapid direction changes
      
      skeleton.direction = -skeleton.direction
      skeleton.flipX = skeleton.direction < 0
      lastCollisionTime = now
      
      // Move slightly away from the wall to prevent getting stuck
      skeleton.pos.x += skeleton.direction * 5
    })

    // Also detect collision with other enemies to prevent stacking
    skeleton.onCollide('enemy', (otherEnemy: any) => {
      if (skeleton.isDead || otherEnemy === skeleton) return
      const now = Date.now()
      if (now - lastCollisionTime < 500) return
      
      skeleton.direction = -skeleton.direction
      skeleton.flipX = skeleton.direction < 0
      lastCollisionTime = now
      
      skeleton.pos.x += skeleton.direction * 5
    })
  }

  private getPlayerController() {
    // This is a placeholder - in a real implementation, you'd get the player controller
    // For now, we'll use the game store directly
    return null
  }

  public createEnemiesForLevel(level: number, levelData: any) {
    if (level >= 2) {
      // Create skeletons for level 2+
      this.createSkeleton(400, 500)
      this.createSkeleton(800, 500)
      this.createSkeleton(1200, 500)
    }
  }

  public destroyAll() {
    for (const [enemy, hpManager] of this.enemies) {
      hpManager.destroyHPBar()
      this.kaplayContext.destroy(enemy)
    }
    this.enemies.clear()
  }
}
