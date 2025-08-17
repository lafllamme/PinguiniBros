export const TILE1_W = 16
export const TILE1_H = 16
export const TILE1_COLS = 16
export const TILE1_ROWS = 16

export function t1Index(col: number, row: number): number {
  if (col < 0 || row < 0 || col >= TILE1_COLS || row >= TILE1_ROWS) {
    throw new Error(`tiles1 index OOB col=${col} row=${row}`)
  }
  return row * TILE1_COLS + col
}

type KaplayCtx = {
  add: (...args: any[]) => any
  sprite: (...args: any[]) => any
  pos: (...args: any[]) => any
  anchor: (...args: any[]) => any
  layer?: (...args: any[]) => any
  z?: (...args: any[]) => any
  scale?: (...args: any[]) => any
  opacity?: (...args: any[]) => any
  area?: (...args: any[]) => any
  body?: (...args: any[]) => any
}

export function makeTiles1Spawner(ctx: KaplayCtx) {
  const { add, sprite, pos, anchor, layer, z } = ctx

  function place(col: number, row: number, x: number, y: number) {
    const comps: any[] = [
      sprite('tiles1', { frame: t1Index(col, row) }),
      pos(x, y),
      anchor('topleft'),
    ]
    if (layer) comps.push(layer('game'))
    if (z) comps.push(z(1))
    return add(comps)
  }

  function placeBlock(col: number, row: number, w: number, h: number, x: number, y: number) {
    const objs: any[] = []
    for (let ry = 0; ry < h; ry++) {
      for (let rx = 0; rx < w; rx++) {
        objs.push(place(col + rx, row + ry, x + rx * TILE1_W, y + ry * TILE1_H))
      }
    }
    return objs
  }

  return { place, placeBlock }
}


