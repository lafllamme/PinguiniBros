import type { GameObj, Vec2 } from 'kaplay'

export interface PlayerConfig {
  speed: number
  jumpForce: number
  maxJumps: number
}

export class Player {
  private gameObj: GameObj
  private config: PlayerConfig
  private currentJumps: number = 0
  private isOnGround: boolean = false
  private facingDirection: 'left' | 'right' = 'right'

  constructor(gameObj: GameObj, config: PlayerConfig = {
    speed: 320,
    jumpForce: 640,
    maxJumps: 2
  }) {
    this.gameObj = gameObj
    this.config = config
    this.setupPlayer()
  }

  private setupPlayer() {
    // Set up player physics
    this.gameObj.onCollide('ground', () => {
      this.isOnGround = true
      this.currentJumps = 0
    })

    this.gameObj.onCollideEnd('ground', () => {
      this.isOnGround = false
    })

    // Set up player controls
    this.setupControls()
  }

  private setupControls() {
    // Movement controls
    onKeyDown('left', () => {
      this.moveLeft()
    })

    onKeyDown('right', () => {
      this.moveRight()
    })

    // Jump control
    onKeyPress('space', () => {
      this.jump()
    })

    // Alternative jump keys
    onKeyPress('up', () => {
      this.jump()
    })

    onKeyPress('w', () => {
      this.jump()
    })
  }

  public moveLeft() {
    this.gameObj.move(-this.config.speed, 0)
    this.facingDirection = 'left'
    this.gameObj.flipX = true
  }

  public moveRight() {
    this.gameObj.move(this.config.speed, 0)
    this.facingDirection = 'right'
    this.gameObj.flipX = false
  }

  public jump() {
    if (this.currentJumps < this.config.maxJumps) {
      this.gameObj.jump(this.config.jumpForce)
      this.currentJumps++
      this.isOnGround = false
    }
  }

  public getPosition(): Vec2 {
    return this.gameObj.pos
  }

  public getFacingDirection(): 'left' | 'right' {
    return this.facingDirection
  }

  public isGrounded(): boolean {
    return this.isOnGround
  }

  public getJumpCount(): number {
    return this.currentJumps
  }

  public resetJumps() {
    this.currentJumps = 0
  }
}
