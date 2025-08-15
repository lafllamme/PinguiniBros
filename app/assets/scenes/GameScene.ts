import { LevelManager } from '../levels/Level1'
import { Level1 } from '../levels/Level1'

export class GameScene {
  private levelManager: LevelManager
  private gameState: GameState = {
    score: 0,
    lives: 3,
    currentLevel: 'level1',
    isPaused: false
  }

  constructor() {
    this.levelManager = new LevelManager(Level1)
  }

  public init() {
    // Set up game physics
    setGravity(1600)
    
    // Load assets
    this.loadAssets()
    
    // Create UI
    this.createUI()
    
    // Load level
    this.levelManager.loadLevel()
    
    // Set up game events
    this.setupGameEvents()
  }

  private loadAssets() {
    // Load sprites
    loadSprite('penguin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_ground', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_platform', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('fish', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('coin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('slime', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('bat', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('goal', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    loadSprite('ice_cave', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    
    // Load sounds
    loadSound('jump', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    loadSound('collect', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
    loadSound('hit', 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT')
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
    add([
      rect(800, 600),
      pos(0, 0),
      color(0, 0, 0, 0.5),
      {
        id: 'pauseOverlay',
        hidden: true
      }
    ])

    add([
      text('PAUSED'),
      pos(350, 250),
      {
        id: 'pauseText',
        hidden: true
      }
    ])
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

interface GameState {
  score: number
  lives: number
  currentLevel: string
  isPaused: boolean
}
