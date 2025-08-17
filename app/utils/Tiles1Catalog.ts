import { TILE1_W, TILE1_H, TILE1_COLS, TILE1_ROWS, t1Index } from './Tiles1Atlas'

type KaplayCtx = {
  add: (...args: any[]) => any
  sprite: (...args: any[]) => any
  pos: (...args: any[]) => any
  anchor: (...args: any[]) => any
  layer: (...args: any[]) => any
  z: (...args: any[]) => any
  text?: (...args: any[]) => any
  color?: (...args: any[]) => any
  scale: (...args: any[]) => any
}

function placeTile(ctx: KaplayCtx, col: number, row: number, x: number, y: number) {
  return ctx.add([
    ctx.sprite('tiles1', { frame: t1Index(col, row) }),
    ctx.pos(x, y),
    ctx.anchor('topleft'),
    ctx.layer('game'),
    ctx.z(1),
    ctx.scale(1.0), // No scaling to prevent overlapping
  ])
}

function placeRect(ctx: KaplayCtx, col: number, row: number, w: number, h: number, x: number, y: number) {
  const parent = ctx.add([ctx.pos(x, y)])
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      parent.add([
        ctx.sprite('tiles1', { frame: t1Index(col + dx, row + dy) }),
        ctx.pos(dx * TILE1_W, dy * TILE1_H),
        ctx.scale(1.0), // No scaling to prevent overlapping
      ])
    }
  }
  return parent
}

function placeComposite(ctx: KaplayCtx, coords: Array<[number, number]>, x: number, y: number) {
  // coords are (col,row)
  const minC = Math.min(...coords.map(([c]) => c))
  const minR = Math.min(...coords.map(([, r]) => r))
  const parent = ctx.add([ctx.pos(x, y)])
  for (const [c, r] of coords) {
    parent.add([
      ctx.sprite('tiles1', { frame: t1Index(c, r) }),
      ctx.pos((c - minC) * TILE1_W, (r - minR) * TILE1_H),
      ctx.scale(1.0), // No scaling to prevent overlapping
    ])
  }
  return parent
}

// Explicit empty cells (row,col) - from user's notes
const EMPTY = new Set<string>([
  '6,0', '7,2', '3,3', '3,4', '7,4', '15,4', '5,10',
])

type RectSpec = { rect: [number, number, number, number] } // [row, col, w, h]
type SpriteSpec = [number, number] | RectSpec               // [row, col] or rect

export const SPRITES: Record<string, SpriteSpec> = {
  // blocks / rocks - (row,col)
  earth_block_1: [0, 0],
  earth_block_2: [1, 0],
  rock_1: [0, 1],
  rock_2: [1, 1],
  sand_block_1: [0, 2],
  sand_block_2: [1, 2],
  sand_block_3: [2, 2],
  sand_rock_1: [0, 3],
  sand_rock_2: [1, 3],
  copper_block_1: [0, 4],
  copper_block_2: [1, 4],
  copper_rock_1: [0, 5],
  copper_rock_2: [1, 5],

  // "cold" blocks & rocks
  cold_block_1: [0, 6],
  cold_block_2: [1, 6],
  cold_block_3: [2, 6],
  cold_block_4: [0, 7],
  cold_block_5: [1, 7],
  cold_rock_1: [0, 8],
  cold_rock_2: [1, 8],

  // question / exclamation
  earth_question: [2, 0],
  earth_exclamation: [2, 1],
  sand_question: [2, 3],
  sand_exclamation: [3, 2],
  copper_question: [2, 4],
  copper_exclamation: [2, 5],
  cold_question: [2, 7],
  cold_exclamation: [2, 8],

  // ✅ FIXED: shields at Row3/4, Col8
  shield_1: [3, 8],
  shield_2: [4, 8],

  // ladders
  ladder_small_1: [3, 9],
  ladder_small_2: [3, 9],

  // ✅ FIXED: ladder_big_* are single tiles (no rects)
  ladder_big_1: [3, 7],
  ladder_big_2: [4, 7],

  // shrooms (big = row7, small = row8)
  shroom_big_1: [5, 7],
  shroom_big_2: [6, 7],
  shroom_big_3: [7, 7],
  shroom_big_4: [8, 7],
  shroom_small_1: [5, 8],
  shroom_small_2: [6, 8],
  shroom_small_3: [7, 8],
  shroom_small_4: [8, 8],

  // ✅ FIXED: bridges are horizontal (3×1) starting at Col9
  bridge_1_rect: { rect: [0, 9, 3, 1] }, // Row0, Col9..11
  bridge_2_rect: { rect: [1, 9, 3, 1] }, // Row1, Col9..11
  bridge_3_rect: { rect: [2, 9, 3, 1] }, // Row2, Col9..11

  // bushes / plants
  bush_big_1: [3, 1],
  bush_big_2: [6, 5],
  bush_big_3: [6, 6],
  bush_medium_1: [4, 1],
  bush_medium_2: [7, 5],
  bush_medium_3: [7, 6],
  bush_small_1: [5, 1],
  bush_small_2: [8, 5],
  bush_small_3: [8, 6],
  bush_small_flowers: [6, 1],

  // bottles
  bottle_1: [7, 0],
  bottle_2: [8, 0],
  bottle_3: [7, 1],
  bottle_4: [8, 1],

  // misc
  pumpkin: [8, 4],
  wood_1: [8, 2],

  // color tiles (rows 0..3, cols 9..15)
  snow_1: [9, 0],  snow_2: [10, 0], snow_3: [11, 0], snow_4: [12, 0], snow_5: [13, 0], snow_6: [14, 0], snow_7: [15, 0],
  beach_1: [9, 1], beach_2: [10, 1], beach_3: [11, 1], beach_4: [12, 1], beach_5: [13, 1], beach_6: [14, 1], beach_7: [15, 1],
  mars_1: [9, 2],  mars_2: [10, 2], mars_3: [11, 2], mars_4: [12, 2], mars_5: [13, 2], mars_6: [14, 2], mars_7: [15, 2],
  mountain_1: [9, 3], mountain_2: [10, 3], mountain_3: [11, 3], mountain_4: [12, 3], mountain_5: [13, 3], mountain_6: [14, 3], mountain_7: [15, 3],

  // waves
  wave_blue_1: [9, 4],   wave_blue_2: [10, 4],
  wave_purple_1: [11, 4], wave_purple_2: [12, 4],
  wave_orange_1: [13, 4], wave_orange_2: [14, 4],
  wave_blue_short: [9, 5],
  wave_purple_short: [11, 5],
  wave_orange_short: [13, 5],
  wave_blue_dark_1: [9, 6],
  wave_blue_dark_2: [10, 6],
  wave_blue_dark_short: [9, 7],
}

export const COMPOSITES: Record<string, Array<[number, number]>> = {
  // ✅ FIXED: coords are (col,row), vertical stacks

  // tree_1: Row3→Row5 at Col0
  tree_1: [
    [0, 3], [0, 4], [0, 5],
  ],

  // tree_2: Row3→Row5 at Col5
  tree_2: [
    [5, 3], [5, 4], [5, 5],
  ],

  // tree_3: Row3→Row5 at Col6
  tree_3: [
    [6, 3], [6, 4], [6, 5],
  ],

  // palm_1 exakt nach deinem Grid (coords sind (col, row))
  // palm_1 exakt nach deiner Reihenfolge (coords sind (col, row))
  palm_1: [
    // Spalte 1 (Col 2): Row 4 → 6
    [2, 4], [2, 5], [2, 6],

    // Spalte 2 (Col 3): Row 4 → 8
    [3, 4], [3, 5], [3, 6], [3, 7], [3, 8],

    // Spalte 3 (Col 4): Row 4 → 6
    [4, 4], [4, 5], [4, 6],
  ],

}

export function placeByName(ctx: KaplayCtx, name: string, x: number, y: number) {
  if (COMPOSITES[name]) return placeComposite(ctx, COMPOSITES[name], x, y)

  const spec = SPRITES[name]
  if (!spec) {
    console.warn(`[Tiles1Catalog] Unknown sprite: ${name}`)
    return null
  }

  if ('rect' in spec) {
    const [row, col, w, h] = spec.rect
    return placeRect(ctx, col, row, w, h, x, y) // placeRect expects (col,row)
  }

  if (Array.isArray(spec)) {
    const [row, col] = spec
    if (EMPTY.has(`${row},${col}`)) {
      console.log(`[Tiles1Catalog] Skipping empty cell: ${row},${col}`)
      return null
    }
    return placeTile(ctx, col, row, x, y) // placeTile expects (col,row)
  }

  console.warn(`[Tiles1Catalog] Invalid sprite spec for ${name}:`, spec)
  return null
}

export function spawnTiles1CatalogShowcase(
  ctx: KaplayCtx,
  startX: number,
  startY: number,
  perRow: number = 8,
  gapX: number = 40,
  gapY: number = 80,
  padX: number = 20,
  padY: number = 25
) {
  const { add, text, pos, anchor, color, layer, z } = ctx

  let x = startX
  let y = startY
  let placedCount = 0
  let rowCount = 0

  const allSprites = Object.keys(SPRITES)
  const allComposites = Object.keys(COMPOSITES)
  const allItems = [...allSprites, ...allComposites]

  console.log(`[Tiles1Catalog] Placing ${allItems.length} items starting at (${startX}, ${startY})`)

  // simple fixed perRow layout
  for (const name of allItems) {
    if (placedCount > 0 && placedCount % perRow === 0) {
      x = startX
      y += gapY + 50
      rowCount++
    }

    if (text && color) {
      add([
        text(`${placedCount + 1}: ${name}`, { size: 13 }),
        pos(x + padX, y),
        anchor('left'),
        color(255, 255, 255),
        layer('game'),
        z(5),
      ])
    }

    const result = placeByName(ctx, name, x + padX, y + padY + 15)
    if (!result) console.warn(`[Tiles1Catalog] Failed to place ${name}`)

    x += 120 + gapX
    placedCount++
  }

  if (text && color) {
    add([
      text(`Placed ${placedCount}/${allItems.length} items in ${rowCount + 1} rows`, { size: 12 }),
      pos(startX, y + 50),
      anchor('left'),
      color(255, 255, 0),
      layer('game'),
      z(5),
    ])
  }

  console.log(`[Tiles1Catalog] Finished placing ${placedCount} items`)
}
