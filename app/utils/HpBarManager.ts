import { useGameStore } from '@/stores/game'

export interface HpBarConfig {
  width: number
  height: number
  offsetY: number
  zIndex: number
}

export class HpBarManager {
  private hpBar: any
  private hpBg: any
  private kaplayContext: any
  private game = useGameStore()
  private config: HpBarConfig
  private target: any

  constructor(target: any, kaplayContext: any, config: HpBarConfig = {
    width: 24,
    height: 3,
    offsetY: -50,
    zIndex: 201
  }) {
    this.target = target
    this.kaplayContext = kaplayContext
    this.config = config
    this.createHpBar()
  }

  private createHpBar() {
    const { add, rect, pos, anchor, color, layer, z } = this.kaplayContext

    // Create background
    this.hpBg = add([
      rect(this.config.width + 4, this.config.height + 2),
      pos(this.target.pos.x, this.target.pos.y + this.config.offsetY),
      anchor('center'),
      color(0, 0, 0),
      layer('ui'),
      z(this.config.zIndex - 1)
    ])

    // Create HP bar
    this.hpBar = add([
      rect(this.config.width, this.config.height),
      pos(this.target.pos.x, this.target.pos.y + this.config.offsetY),
      anchor('center'),
      color(0, 255, 0),
      layer('ui'),
      z(this.config.zIndex)
    ])

    this.updateHpBar()
    this.setupUpdateLoop()
  }

  private updateHpBar() {
    const currentHp = this.target.health || this.game.player.hp
    const maxHp = this.target.maxHealth || this.game.player.maxHp
    const pct = Math.max(0, Math.min(1, currentHp / maxHp))
    const w = Math.round(this.config.width * pct)

    // Update width
    this.hpBar.width = w

    // Update color based on health percentage
    if (pct > 0.6) {
      this.hpBar.color = this.kaplayContext.color(0, 255, 0) // Green
    } else if (pct > 0.3) {
      this.hpBar.color = this.kaplayContext.color(255, 255, 0) // Yellow
    } else {
      this.hpBar.color = this.kaplayContext.color(255, 0, 0) // Red
    }
  }

  private setupUpdateLoop() {
    const { onUpdate } = this.kaplayContext

    onUpdate(() => {
      if (!this.target || !this.hpBar || !this.hpBg) return

      // Follow target
      const uiX = Math.round(this.target.pos.x)
      const uiY = Math.round(this.target.pos.y + this.config.offsetY)

      this.hpBg.pos.x = uiX
      this.hpBg.pos.y = uiY
      this.hpBar.pos.x = uiX
      this.hpBar.pos.y = uiY

      // Update HP bar
      this.updateHpBar()
    })
  }

  public destroy() {
    if (this.hpBar) {
      this.kaplayContext.destroy(this.hpBar)
      this.hpBar = null
    }
    if (this.hpBg) {
      this.kaplayContext.destroy(this.hpBg)
      this.hpBg = null
    }
  }

  public forceUpdate() {
    this.updateHpBar()
  }
}
