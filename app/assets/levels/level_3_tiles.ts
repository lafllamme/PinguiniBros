import { makeTileSpawner, spawnByName, TILE_H, TILE_W } from '@/utils/TilesAtlas'

type KaplayCtx = {
  add: (...args: any[]) => any
  sprite: (...args: any[]) => any
  pos: (...args: any[]) => any
  anchor: (...args: any[]) => any
  layer: (...args: any[]) => any
  z: (...args: any[]) => any
}

export function decorateLevel3Tiles(ctx: KaplayCtx, levelWidth: number) {
  const { add, sprite, pos, anchor, layer, z } = ctx
  const spawner = makeTileSpawner({ add, sprite, pos, anchor, layer, z })

  // Baseline: simple grass/dirt border along the ground (decorative)
  const groundY = 550 - TILE_H // visual top of ground rectangles
  for (let x = 0; x < levelWidth; x += TILE_W) {
    // Use an early tile as placeholder (update indices when visually mapped)
    spawner.spawn1x1(0, 0, x, groundY, 'top_left', { layerName: 'game', zIndex: 0 })
  }

  // A tree near the start (uses manifest name if available)
  try { spawnByName({ add, sprite, pos, anchor, layer, z }, 'tree_big', 220, 550) } catch {}

  // Ladder segments somewhere mid-level
  const ladderX = Math.max(400, Math.floor(levelWidth * 0.35))
  for (let i = 0; i < 3; i++) {
    try { spawnByName({ add, sprite, pos, anchor, layer, z }, 'ladder_segment', ladderX, 550 - i * TILE_H) } catch {}
  }

  // A banner near the end
  try { spawnByName({ add, sprite, pos, anchor, layer, z }, 'banner_red', Math.max(120, levelWidth - 120), 520) } catch {}

  // Small scattered decorations (placeholder indices)
  const decoCols = [1, 2, 3]
  const decoRow = 1
  for (let i = 0; i < 12; i++) {
    const x = Math.floor(Math.random() * (levelWidth - TILE_W))
    const c = decoCols[i % decoCols.length]
    spawner.spawn1x1(c, decoRow, x, groundY, 'top_left', { layerName: 'game', zIndex: 0 })
  }
}


