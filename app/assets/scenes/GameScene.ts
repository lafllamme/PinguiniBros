import { useGameStore } from '@/stores/game'
import { Level1, type LevelDef } from '@/assets/levels/level_1'
import { clonePlayer } from '@/assets/characters/Enemy'
import { initCoinSystem, loadCoinAssets, spawnCoinsRandom, onScoreChanged, playLobbyMusic } from '@/utils/coinSystem'

export class GameScene {
  private level: LevelDef
  private game = useGameStore()
  private hpColorState: 'g' | 'y' | 'r' = 'g'

  constructor(level: LevelDef = Level1) {
    this.level = level
  }

  public init() {
    setGravity(this.level.gravity)
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
    this.createBackground()
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
    const p = add([sprite('player_idle'), pos(this.level.playerStart.x, this.level.playerStart.y), anchor('center'), area(), body(), scale(1.5), layer('game'), z(10), 'player'])
    p.play('idle')
  }

  // --- Player HP UI ---
  private playerHpBar: any
  private playerHpBg: any
  private playerHpW = 40
  private playerHpH = 6
  private lastDamageTs = 0
  private regenTimer = 0

  private createPlayerUI() {
    const player = get('player')[0]
    if (!player) return
    // Background centered
    this.playerHpBg = add([
      rect(this.playerHpW + 2, this.playerHpH + 2),
      pos(player.pos.x, player.pos.y - 60),
      anchor('center'),
      color(0, 0, 0),
      layer('ui'),
      z(200),
    ])
    // Foreground bar left-anchored so it shrinks right->left
    this.playerHpBar = add([
      rect(this.playerHpW, this.playerHpH),
      pos(player.pos.x - this.playerHpW / 2, player.pos.y - 60),
      anchor('left'),
      color(0, 255, 0),
      layer('ui'),
      z(201),
    ])

    const updateBar = () => {
      const pct = Math.max(0, Math.min(1, this.game.player.hp / this.game.player.maxHp))
      const w = this.game.player.hp <= 0 ? 0 : Math.floor(this.playerHpW * pct)

      // Determine color bucket
      const state: 'g' | 'y' | 'r' = pct > 0.6 ? 'g' : pct > 0.3 ? 'y' : 'r'
      const clr = state === 'g' ? color(0, 255, 0) : state === 'y' ? color(255, 255, 0) : color(255, 0, 0)

      // Position reference (left-anchored bar)
      const pl = get('player')[0]
      if (!pl) return
      const x = Math.round(pl.pos.x)
      const y = Math.round(pl.pos.y - 50)

      if (state !== this.hpColorState) {
        // Rebuild bar to guarantee color update in Kaplay
        destroy(this.playerHpBar)
        this.playerHpBar = add([
          rect(w, this.playerHpH),
          pos(x - this.playerHpW / 2, y),
          anchor('left'),
          clr,
          layer('ui'),
          z(201),
        ])
        this.hpColorState = state
      } else {
        // Update width only
        this.playerHpBar.width = w
      }

      // Debug log for HP bar changes
      console.log(`[HP] Bar update: hp=${this.game.player.hp}/${this.game.player.maxHp}, pct=${(pct*100).toFixed(1)}%, width=${w}/${this.playerHpW}`)
    }
    updateBar()

    // Lightweight update loop: only recalc width when HP or pos changed
    let lastHp = this.game.player.hp
    let lastX = 0
    let lastY = 0
    onUpdate(() => {
      const pl = get('player')[0]
      if (!pl) return
      const x = Math.round(pl.pos.x)
      const y = Math.round(pl.pos.y - 60)
      // Background stays centered
      this.playerHpBg.pos.x = x
      this.playerHpBg.pos.y = y
      // Foreground begins at the left edge of the bg
      this.playerHpBar.pos.x = x - this.playerHpW / 2
      this.playerHpBar.pos.y = y
      if (x !== lastX || y !== lastY) {
        lastX = x; lastY = y
        // positions already set above
      }
      if (this.game.player.hp !== lastHp) {
        lastHp = this.game.player.hp
        updateBar()
      }
      // Regen after no damage for 5s, then 1 HP every 2s
      const now = Date.now()
      // Do not regen during death animation
      if ((pl as any).isDead) return
      const msSinceDamage = now - this.game.lastDamageAt
      if (msSinceDamage > 5000 && this.game.player.hp < this.game.player.maxHp) {
        this.regenTimer += dt()
        if (this.regenTimer >= 2) {
          this.game.healPlayer(1)
          console.log(`[HP] Regen +1 -> ${this.game.player.hp}/${this.game.player.maxHp}`)
          updateBar()
          this.regenTimer = 0
        }
      } else {
        // reset the regen timer while taking damage window is active
        this.regenTimer = 0
      }
    })

    // External damage hook so other modules can mark damage and force an update
    // Regen timer driven by store timestamps; no window hooks needed

    // expose for damage hooks
    ;(this as any).updatePlayerHpBar = updateBar
  }

  private createPlatforms() {
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

    const hpBg = add([rect(42, 8), pos(x, y - 60), anchor('center'), color(0, 0, 0), layer('ui'), z(19)])
    const hpBar = add([rect(40, 6), pos(x, y - 60), anchor('center'), color(0, 255, 0), layer('ui'), z(20)])
    const updateHp = () => {
      const p = sk.health / sk.maxHealth
      hpBar.width = Math.round(40 * p)
      hpBar.color = p > 0.5 ? color(0, 255, 0) : p > 0.25 ? color(255, 255, 0) : color(255, 0, 0)
    }
    updateHp()

    onUpdate(() => {
      if (sk.isDead) return
      // Follow hp bar
      const uiX = Math.round(sk.pos.x)
      const uiY = Math.round(sk.pos.y - 60)
      hpBg.pos.x = uiX
      hpBg.pos.y = uiY
      hpBar.pos.x = uiX
      hpBar.pos.y = uiY

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
      sk.health -= 1
      updateHp()
      sk.play('hit')
      if (sk.health <= 0) {
        sk.isDead = true
        sk.play('dead')
        destroy(hpBg)
        destroy(hpBar)
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
    playLobbyMusic(0.6)
    spawnCoinsRandom(this.level.coins.length || 15, { x: 0, y: 0, w: this.level.width, h: 600 }, { falling: false })
    onScoreChanged((n: number) => {
      this.game.addScore(n - this.game.score)
      const scoreText = get('scoreText')[0]
      if (scoreText) scoreText.text = `Score: ${this.game.score}`
    })
  }

  // player damage + lives handling
  private damagePlayer(n: number) {
    this.game.damagePlayer(n)
    this.lastDamageTs = Date.now()
    console.log(`[HP] Damage -${n} -> ${this.game.player.hp}/${this.game.player.maxHp}`)
    const update = (this as any).updatePlayerHpBar
    if (typeof update === 'function') update()
    const livesText = get('livesText')[0]
    if (this.game.player.hp <= 0) {
      this.game.loseLife()
      if (livesText) livesText.text = `Lives: ${this.game.lives}`
      if (this.game.lives <= 0) {
        go('gameOver', { level: this.game.currentLevel })
      } else {
        this.game.respawnPlayer()
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
