import { useGameStore } from '@/stores/game'
import { Level1, type LevelDef } from '@/assets/levels/level_1'
import { Level3 } from '@/assets/levels/level_3'
import { clonePlayer } from '@/assets/characters/Enemy'
import { initCoinSystem, loadCoinAssets, spawnCoinsRandom, onScoreChanged } from '@/utils/coinSystem'
import { audioManager } from '@/utils/AudioManager'
import { hpManager } from '@/utils/HPManager'

export class GameScene {
  private level: LevelDef
  private game = useGameStore()

  constructor(level: LevelDef = Level1) {
    this.level = level
  }

  public init() {
    setGravity(this.level.gravity)
    // Ensure full HP on (re)spawn when entering the scene
    this.game.respawnPlayer()
    initCoinSystem({
      add,
      sprite,
      pos,
      area,
      body,
      z,
      anchor,
      destroy,
      loadSprite,
      loadSound,
      play,
      lifespan,
      opacity,
      rand,
    } as any)
    // Background is now created in the main scene
    this.createPlayer()
    this.createPlayerUI()
    this.createPlatforms()
    this.createEnemies()
    this.setupCoinsAndMusic()
  }

  private createBackground() {
    add([sprite('level_bg'), pos(0, 0), anchor('topleft'), layer('bg'), fixed()])
  }

  private createPlayer() {
    // Use default collider; we'll tighten enemies instead to reduce the gap
    const p = add([
      sprite('player_idle'),
      pos(this.level.playerStart.x, this.level.playerStart.y),
      anchor('center'),
      area(),
      body(),
      scale(1.5),
      layer('game'),
      z(10),
      'player'
    ])
    p.play('idle')
  }

  // --- Player HP UI ---
  private playerHpBar: any
  private playerHpBg: any

  private createPlayerUI() {
    const player = get('player')[0]
    if (!player) return
    
    // Use HPManager to create and manage HP bar
    const hpBarElements = hpManager.createHPBar(
      player,
      add,
      rect,
      pos,
      anchor,
      color,
      layer,
      z,
      destroy
    )
    
    // Store references if needed
    this.playerHpBar = hpBarElements?.hpBar
    this.playerHpBg = hpBarElements?.hpBarBg

    // Update loop for HP bar position and regeneration
    onUpdate(() => {
      const pl = get('player')[0]
      if (!pl) return
      
      // Update HP bar position
      hpManager.updateHPBarPosition(pl)
      
      // Handle regeneration
      hpManager.updateRegeneration(dt(), pl)
    })

    // expose for damage hooks
    ;(this as any).updatePlayerHpBar = () => hpManager.updateHPBar()
  }

  private createPlatforms() {
    // Skip green platforms for Level 3 (sand theme)
    if (this.level.width === 3200) return // Level 3 has width 3200
    
    for (const plt of this.level.platforms) {
      add([rect(plt.w, plt.h), pos(plt.x, plt.y), area(), body({ isStatic: true }), color(34, 139, 34), layer('game'), z(1)])
    }
  }

  private createEnemies() {
    // Disabled - skeletons are now created in GameCanvas.vue
    // for (const e of this.level.enemies) {
    //   this.createSkeleton(e.x, e.y)
    // }
  }

  private createSkeleton(x: number, y: number) {
    const sk = add([
      sprite('skeleton'),
      pos(x, y),
      anchor('center'),
      scale(1.5), // Match player scale for consistency
      area(),
      body(),
      layer('game'),
      z(5),
      'enemy',
      'skeleton',
      { direction: 1, isAttacking: false, isDead: false, speed: 80, patrolStart: x - 100, patrolEnd: x + 100, health: 3, maxHealth: 3 },
    ])
    sk.play('idle')

    // Create HP bar using unified HPManager
    const enemyHpManager = new HPManager({
      width: 40,
      height: 6,
      offsetY: -60,
      zIndex: 20,
      target: sk,
      isEnemy: true
    })

    const hpBarElements = enemyHpManager.createHPBar(
      sk,
      add,
      rect,
      pos,
      anchor,
      color,
      layer,
      z,
      destroy
    )

    onUpdate(() => {
      if (sk.isDead) return
      
      // Update HP bar position and display
      enemyHpManager.updateHPBarPosition(sk)
      enemyHpManager.updateHPBar()

      // chase / patrol
      const player = get('player')[0]
      if (!player) return
      const dx = player.pos.x - sk.pos.x
      const dist = Math.abs(dx)
      if (dist < 160 && !sk.isAttacking) {
        sk.direction = dx > 0 ? 1 : -1
        sk.flipX = sk.direction < 0
        sk.vel.x = sk.speed * sk.direction
        sk.play('walk')
      } else if (!sk.isAttacking) {
        sk.play('walk')
        sk.vel.x = sk.speed * sk.direction
        if (sk.pos.x <= sk.patrolStart) { sk.direction = 1; sk.flipX = false }
        if (sk.pos.x >= sk.patrolEnd) { sk.direction = -1; sk.flipX = true }
      }

      // attack if close
      if (dist < 70 && !sk.isAttacking) {
        sk.isAttacking = true
        sk.vel.x = 0
        sk.play('attack')
        const hit = add([rect(70, 50), pos(sk.pos.x + sk.direction * 35, sk.pos.y), anchor('center'), area(), layer('game'), z(10), opacity(0), 'skeletonAttack', lifespan(0.35, { fade: 0 })])
        hit.onCollide('player', () => this.damagePlayer(1))
        setTimeout(() => {
          sk.isAttacking = false
          if (!sk.isDead) sk.play('walk')
        }, 700)
      }
    })

    sk.onCollide('playerAttack', () => {
      if (sk.isDead) return
      
      // Use HPManager to handle enemy damage
      enemyHpManager.damageEnemy(1)
      sk.play('hit')
      
      if (enemyHpManager.isEnemyDead()) {
        sk.isDead = true
        sk.play('dead')
        enemyHpManager.destroyHPBar()
        setTimeout(() => destroy(sk), 1600)
      }
    })

    return sk
  }

  private createUI() {
    // Score display
    add([
      text('Score: 0'),
      pos(20, 20),
      {
        id: 'scoreText',
        value: 0
      }
    ])

    // Lives display
    add([
      text('Lives: 3'),
      pos(20, 50),
      {
        id: 'livesText',
        value: 3
      }
    ])

    // Level display
    add([
      text('Level: Ice Cave Entrance'),
      pos(20, 80),
      {
        id: 'levelText'
      }
    ])

    // Pause button
    add([
      text('Pause'),
      pos(700, 20),
      area(),
      'pauseButton'
    ])

    // Pause overlay
    const pauseOverlayObj = add([
      rect(800, 600),
      pos(0, 0),
      color(0, 0, 0, 0.5),
      {
        id: 'pauseOverlay'
      }
    ])
    pauseOverlayObj.hidden = true

    const pauseTextObj = add([
      text('PAUSED'),
      pos(350, 250),
      {
        id: 'pauseText'
      }
    ])
    pauseTextObj.hidden = true
  }

  private async setupCoinsAndMusic() {
    await loadCoinAssets()
    audioManager.playMusic('lobby', { volume: 0.45 })
    spawnCoinsRandom(this.level.coins.length || 15, { x: 0, y: 0, w: this.level.width, h: 600 }, { falling: false })
    onScoreChanged((n: number) => {
      this.game.addScore(n - this.game.score)
      const scoreText = get('scoreText')[0]
      if (scoreText) scoreText.text = `Score: ${this.game.score}`
    })
  }

  // player damage + lives handling
  private damagePlayer(n: number) {
    // Use HPManager to handle damage
    const damageApplied = hpManager.applyDamage(n, {
      playSound: true,
      soundVolume: 0.4,
      triggerDeath: true
    })
    
    if (!damageApplied) return
    
    console.log(`[HP] Damage -${n} -> ${this.game.player.hp}/${this.game.player.maxHp}`)
    
    // Update HP bar
    const update = (this as any).updatePlayerHpBar
    if (typeof update === 'function') update()
    
    // Handle death logic
    if (hpManager.isPlayerDead()) {
      this.game.loseLife()
      const livesText = get('livesText')[0]
      if (livesText) livesText.text = `Lives: ${this.game.lives}`
      
      if (this.game.lives <= 0) {
        go('gameOver', { level: this.game.currentLevel })
      } else {
        hpManager.respawnPlayer()
        if (typeof update === 'function') update()
      }
    }
  }

  private setupGameEvents() {
    // Pause functionality
    onClick('pauseButton', () => {
      this.togglePause()
    })

    // Pause with ESC key
    onKeyPress('escape', () => {
      this.togglePause()
    })

    // Player death
    onCollide('player', 'enemy', (player, enemy) => {
      this.playerHit()
    })

    // Player falls off screen
    onUpdate(() => {
      const player = get('player')[0]
      if (player && player.pos.y > 600) {
        this.playerDeath()
      }
    })
  }

  private togglePause() {
    this.gameState.isPaused = !this.gameState.isPaused
    
    const pauseOverlay = get('pauseOverlay')[0]
    const pauseText = get('pauseText')[0]
    
    if (this.gameState.isPaused) {
      pauseOverlay.hidden = false
      pauseText.hidden = false
    } else {
      pauseOverlay.hidden = true
      pauseText.hidden = true
    }
  }

  private playerHit() {
    play('hit')
    this.gameState.lives--
    this.updateUI()
    
    if (this.gameState.lives <= 0) {
      this.gameOver()
    } else {
      this.respawnPlayer()
    }
  }

  private playerDeath() {
    this.gameState.lives--
    this.updateUI()
    
    if (this.gameState.lives <= 0) {
      this.gameOver()
    } else {
      this.respawnPlayer()
    }
  }

  private respawnPlayer() {
    // Use HPManager to reset player state
    hpManager.respawnPlayer()
    
    // Remove current player
    destroyAll('player')
    
    // Create new player at start position
    const playerObj = add([
      sprite('penguin'),
      pos(Level1.playerStartPos),
      area(),
      body(),
      'player'
    ])
  }

  private gameOver() {
    go('gameOver', { score: this.gameState.score })
  }

  private updateUI() {
    const scoreText = get('scoreText')[0]
    const livesText = get('livesText')[0]
    
    if (scoreText) {
      scoreText.text = `Score: ${this.gameState.score}`
    }
    
    if (livesText) {
      livesText.text = `Lives: ${this.gameState.lives}`
    }
  }

  public updateScore(points: number) {
    this.gameState.score += points
    this.updateUI()
  }
}

interface GameState {}
