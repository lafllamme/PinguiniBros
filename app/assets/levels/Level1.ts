import type { Vec2 } from 'kaplay'
import { Player } from '../characters/Player'
import { Enemy, EnemyType, createEnemy } from '../characters/Enemy'

export interface LevelData {
  id: string
  name: string
  playerStartPos: Vec2
  platforms: PlatformData[]
  collectibles: CollectibleData[]
  enemies: EnemyData[]
  goal: GoalData
  background: string
}

export interface PlatformData {
  pos: Vec2
  size: Vec2
  sprite: string
  isMoving?: boolean
  moveDistance?: number
  moveSpeed?: number
}

export interface CollectibleData {
  pos: Vec2
  type: 'fish' | 'coin' | 'gem'
  sprite: string
  points: number
}

export interface EnemyData {
  pos: Vec2
  type: EnemyType
  sprite: string
}

export interface GoalData {
  pos: Vec2
  sprite: string
}

export const Level1: LevelData = {
  id: 'level1',
  name: 'Ice Cave Entrance',
  playerStartPos: vec2(50, 400),
  background: 'ice_cave',
  platforms: [
    // Ground
    {
      pos: vec2(0, 550),
      size: vec2(800, 50),
      sprite: 'ice_ground'
    },
    // Platforms
    {
      pos: vec2(200, 450),
      size: vec2(100, 20),
      sprite: 'ice_platform'
    },
    {
      pos: vec2(400, 350),
      size: vec2(100, 20),
      sprite: 'ice_platform'
    },
    {
      pos: vec2(600, 250),
      size: vec2(100, 20),
      sprite: 'ice_platform'
    },
    // Moving platform
    {
      pos: vec2(300, 300),
      size: vec2(80, 15),
      sprite: 'ice_platform',
      isMoving: true,
      moveDistance: 100,
      moveSpeed: 50
    }
  ],
  collectibles: [
    {
      pos: vec2(250, 400),
      type: 'fish',
      sprite: 'fish',
      points: 10
    },
    {
      pos: vec2(450, 300),
      type: 'fish',
      sprite: 'fish',
      points: 10
    },
    {
      pos: vec2(650, 200),
      type: 'coin',
      sprite: 'coin',
      points: 5
    }
  ],
  enemies: [
    {
      pos: vec2(300, 500),
      type: EnemyType.SLIME,
      sprite: 'slime'
    },
    {
      pos: vec2(500, 200),
      type: EnemyType.BAT,
      sprite: 'bat'
    }
  ],
  goal: {
    pos: vec2(750, 200),
    sprite: 'goal'
  }
}

export class LevelManager {
  private currentLevel: LevelData
  private player: Player | null = null
  private enemies: Enemy[] = []
  private collectibles: any[] = []
  private platforms: any[] = []
  private score: number = 0

  constructor(level: LevelData) {
    this.currentLevel = level
  }

  public loadLevel() {
    // Load background
    this.loadBackground()
    
    // Create platforms
    this.createPlatforms()
    
    // Create collectibles
    this.createCollectibles()
    
    // Create enemies
    this.createEnemies()
    
    // Create goal
    this.createGoal()
    
    // Create player
    this.createPlayer()
    
    // Set up level completion
    this.setupLevelCompletion()
  }

  private loadBackground() {
    add([
      sprite(this.currentLevel.background),
      pos(0, 0),
      scale(800, 600)
    ])
  }

  private createPlatforms() {
    this.currentLevel.platforms.forEach(platformData => {
      const platform = add([
        sprite(platformData.sprite),
        pos(platformData.pos),
        area(),
        body({ isStatic: true }),
        scale(platformData.size.x, platformData.size.y),
        'ground'
      ])

      if (platformData.isMoving) {
        this.setupMovingPlatform(platform, platformData)
      }

      this.platforms.push(platform)
    })
  }

  private setupMovingPlatform(platform: any, data: PlatformData) {
    const startPos = data.pos.x
    let direction = 1

    platform.onUpdate(() => {
      const currentX = platform.pos.x
      
      if (currentX <= startPos - data.moveDistance! || 
          currentX >= startPos + data.moveDistance!) {
        direction *= -1
      }
      
      platform.move(data.moveSpeed! * direction, 0)
    })
  }

  private createCollectibles() {
    this.currentLevel.collectibles.forEach(collectibleData => {
      const collectible = add([
        sprite(collectibleData.sprite),
        pos(collectibleData.pos),
        area(),
        collectibleData.type
      ])

      this.collectibles.push(collectible)
    })
  }

  private createEnemies() {
    this.currentLevel.enemies.forEach(enemyData => {
      const enemyConfig = createEnemy(enemyData.type, enemyData.pos)
      const enemyObj = add([
        sprite(enemyData.sprite),
        pos(enemyData.pos),
        area(),
        body(),
        'enemy'
      ])

      const enemy = new Enemy(enemyObj, enemyConfig)
      this.enemies.push(enemy)
    })
  }

  private createGoal() {
    add([
      sprite(this.currentLevel.goal.sprite),
      pos(this.currentLevel.goal.pos),
      area(),
      'goal'
    ])
  }

  private createPlayer() {
    const playerObj = add([
      sprite('penguin'),
      pos(this.currentLevel.playerStartPos),
      area(),
      body(),
      'player'
    ])

    this.player = new Player(playerObj)
  }

  private setupLevelCompletion() {
    // Player reaches goal
    onCollide('player', 'goal', () => {
      this.completeLevel()
    })

    // Player collects items
    onCollide('player', 'fish', (player, fish) => {
      this.score += 10
      destroy(fish)
    })

    onCollide('player', 'coin', (player, coin) => {
      this.score += 5
      destroy(coin)
    })

    onCollide('player', 'gem', (player, gem) => {
      this.score += 25
      destroy(gem)
    })
  }

  private completeLevel() {
    // Level completion logic
    go('levelComplete', { score: this.score, levelId: this.currentLevel.id })
  }

  public getScore(): number {
    return this.score
  }

  public getPlayer(): Player | null {
    return this.player
  }
}
