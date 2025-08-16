// Centralized character definitions for the game
// Keep this file framework-agnostic so it can be reused in scenes or stores

export interface BaseStats {
  maxHp: number
  hp: number
  lives: number
  speed: number
}

export interface AttackStats {
  damage: number
  range: number
  cooldownMs: number
}

export interface PlayerStats extends BaseStats {
  jumpForce: number
  maxJumps: number
  attack: AttackStats
}

export interface EnemyStats extends BaseStats {
  patrolRange: number
  attack: AttackStats
}

export const defaultPlayer: PlayerStats = {
  maxHp: 10,
  hp: 10,
  lives: 3,
  speed: 320,
  jumpForce: 640,
  maxJumps: 2,
  attack: {
    damage: 1,
    range: 32,
    cooldownMs: 520,
  },
}

export const skeletonEnemy: EnemyStats = {
  maxHp: 3,
  hp: 3,
  lives: 1,
  speed: 80,
  patrolRange: 100,
  attack: {
    damage: 1,
    range: 40,
    cooldownMs: 700,
  },
}

export type CharacterKind = 'player' | 'skeleton'

export function clonePlayer(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return { ...defaultPlayer, ...overrides, attack: { ...defaultPlayer.attack, ...overrides.attack } }
}

export function cloneSkeleton(overrides: Partial<EnemyStats> = {}): EnemyStats {
  return { ...skeletonEnemy, ...overrides, attack: { ...skeletonEnemy.attack, ...overrides.attack } }
}
