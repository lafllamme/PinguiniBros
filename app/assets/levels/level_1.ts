import type { EnemyStats } from '@/assets/characters/Enemy'

export interface LevelDef {
  width: number
  gravity: number
  platforms: Array<{ x: number; y: number; w: number; h: number }>
  enemies: Array<{ x: number; y: number; kind: 'skeleton'; stats?: Partial<EnemyStats> }>
  coins: Array<{ x: number; y: number }>
  playerStart: { x: number; y: number }
}

export const Level1: LevelDef = {
  width: 2400,
  gravity: 1600,
  platforms: [
    { x: 300, y: 450, w: 100, h: 20 },
    { x: 700, y: 380, w: 100, h: 20 },
    { x: 1100, y: 320, w: 100, h: 20 },
    { x: 1450, y: 300, w: 120, h: 20 },
    { x: 1750, y: 260, w: 140, h: 20 },
  ],
  enemies: [
    { x: 400, y: 500, kind: 'skeleton' },
    { x: 800, y: 500, kind: 'skeleton' },
    { x: 1200, y: 500, kind: 'skeleton' },
  ],
  coins: [
    { x: 150, y: 500 },
    { x: 220, y: 500 },
    { x: 290, y: 500 },
  ],
  playerStart: { x: 50, y: 450 },
}


