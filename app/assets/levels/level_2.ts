import type { EnemyStats } from '@/assets/characters/Enemy'

export interface LevelDef {
  width: number
  gravity: number
  platforms: Array<{ x: number; y: number; w: number; h: number }>
  enemies: Array<{ x: number; y: number; kind: 'skeleton'; stats?: Partial<EnemyStats> }>
  coins: Array<{ x: number; y: number }>
  playerStart: { x: number; y: number }
}

export const Level2: LevelDef = {
  width: 2800,
  gravity: 1600,
  platforms: [
    { x: 350, y: 480, w: 140, h: 20 },
    { x: 720, y: 420, w: 120, h: 20 },
    { x: 980, y: 360, w: 160, h: 20 },
    { x: 1320, y: 320, w: 120, h: 20 },
    { x: 1600, y: 280, w: 140, h: 20 },
    { x: 1950, y: 260, w: 160, h: 20 },
    { x: 2250, y: 240, w: 180, h: 20 },
  ],
  enemies: [
    { x: 600, y: 520, kind: 'skeleton' },
    { x: 1000, y: 520, kind: 'skeleton' },
    { x: 1500, y: 520, kind: 'skeleton' },
    { x: 2000, y: 520, kind: 'skeleton' },
    { x: 2400, y: 520, kind: 'skeleton' },
  ],
  coins: [
    { x: 320, y: 480 },
    { x: 380, y: 480 },
    { x: 440, y: 480 },
    { x: 980, y: 340 },
    { x: 1320, y: 300 },
    { x: 2250, y: 220 },
  ],
  playerStart: { x: 60, y: 500 },
}


