import type { EnemyStats } from '@/app/assets/characters/Enemy'

export interface LevelDef {
  width: number
  gravity: number
  platforms: Array<{ x: number; y: number; w: number; h: number }>
  enemies: Array<{ x: number; y: number; kind: 'skeleton'; stats?: Partial<EnemyStats> }>
  coins: Array<{ x: number; y: number }>
  playerStart: { x: number; y: number }
}

export const Level3: LevelDef = {
  width: 3200,
  gravity: 1600,
  platforms: [
    { x: 300, y: 500, w: 140, h: 20 },
    { x: 700, y: 460, w: 120, h: 20 },
    { x: 1000, y: 420, w: 140, h: 20 },
    { x: 1350, y: 380, w: 140, h: 20 },
    { x: 1700, y: 340, w: 160, h: 20 },
    { x: 2050, y: 300, w: 160, h: 20 },
    { x: 2400, y: 280, w: 180, h: 20 },
    { x: 2800, y: 260, w: 160, h: 20 },
  ],
  enemies: [
    { x: 600, y: 540, kind: 'skeleton' },
    { x: 1100, y: 540, kind: 'skeleton' },
    { x: 1500, y: 540, kind: 'skeleton' },
    { x: 1950, y: 540, kind: 'skeleton', stats: { speed: 90 } },
    { x: 2350, y: 540, kind: 'skeleton', stats: { attack: { damage: 2, range: 42, cooldownMs: 650 } } },
    { x: 2750, y: 540, kind: 'skeleton' },
  ],
  coins: [
    { x: 320, y: 500 },
    { x: 380, y: 500 },
    { x: 440, y: 500 },
    { x: 1000, y: 400 },
    { x: 1700, y: 320 },
    { x: 2400, y: 260 },
    { x: 2800, y: 240 },
  ],
  playerStart: { x: 60, y: 520 },
}


