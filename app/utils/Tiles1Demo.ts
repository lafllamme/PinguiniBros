import { TILE1_COLS, TILE1_ROWS, TILE1_W, TILE1_H, t1Index, makeTiles1Spawner } from './Tiles1Atlas'

type KaplayCtx = {
  add: (...args: any[]) => any
  sprite: (...args: any[]) => any
  pos: (...args: any[]) => any
  anchor: (...args: any[]) => any
  layer: (...args: any[]) => any
  z: (...args: any[]) => any
  text?: (...args: any[]) => any
  color?: (...args: any[]) => any
  fixed?: (...args: any[]) => any
  onKeyPressRepeat?: (...args: any[]) => any
}

export function spawnTiles1Board(ctx: KaplayCtx, x: number, y: number, opts?: { gapX?: number; gapY?: number; withLabels?: boolean }) {
  const { add, sprite, pos, anchor, layer, z, text, color } = ctx
  const gapX = Math.max(0, opts?.gapX ?? 0)
  const gapY = Math.max(0, opts?.gapY ?? 0)
  if (opts?.withLabels && text && color) {
    add([text('Tiles1 Board (16x16 @ 16px)', { size: 12 }), pos(x, y - 14), anchor('left'), color(255, 255, 255), layer('ui'), z(100)])
  }
  for (let row = 0; row < TILE1_ROWS; row++) {
    for (let col = 0; col < TILE1_COLS; col++) {
      add([
        sprite('tiles1', { frame: t1Index(col, row) }),
        pos(x + col * (TILE1_W + gapX), y + row * (TILE1_H + gapY)),
        anchor('topleft'),
      ])
    }
  }
}

// Render each row separated with labels for easy identification
export function spawnTiles1RowsSeparated(
  ctx: KaplayCtx,
  x: number,
  y: number,
  opts?: { gapX?: number; rowGap?: number; withRowLabels?: boolean; withColLabels?: boolean }
) {
  const { add, sprite, pos, anchor, layer, z, text, color } = ctx
  const gapX = Math.max(0, opts?.gapX ?? 6)
  const rowGap = Math.max(0, opts?.rowGap ?? 10)
  for (let row = 0; row < TILE1_ROWS; row++) {
    const rowY = y + row * (TILE1_H + rowGap)
    if (opts?.withRowLabels && text && color) {
      add([text(`row ${row}`, { size: 10 }), pos(x - 36, rowY + TILE1_H / 2 - 6), anchor('left'), color(255, 255, 255), layer('ui'), z(100)])
    }
    for (let col = 0; col < TILE1_COLS; col++) {
      const cx = x + col * (TILE1_W + gapX)
      add([sprite('tiles1', { frame: t1Index(col, row) }), pos(cx, rowY), anchor('topleft')])
      if (opts?.withColLabels && text && color && row === 0) {
        add([text(String(col), { size: 10 }), pos(cx, rowY - 12), anchor('left'), color(255, 255, 0), layer('ui'), z(100)])
      }
    }
  }
}

export function spawnTiles1Showcase(ctx: KaplayCtx, x: number, y: number) {
  const S = makeTiles1Spawner(ctx)
  // Ground strip demo (use first row as placeholder)
  for (let i = 0; i < 12; i++) S.place(i % 4, 0, x + i * TILE1_W, y)
  // Small stack (crate-like placeholder row 3)
  S.place(5, 3, x + 240, y)
  S.place(5, 3, x + 240, y - TILE1_H)
  // A 3x2 big object (placeholder area)
  S.placeBlock(8, 4, 3, 2, x + 300, y - TILE1_H)
  // A vertical 1x4 (e.g., column)
  S.placeBlock(0, 12, 1, 4, x + 380, y - 3 * TILE1_H)
}

export function spawnTiles1Picker(ctx: KaplayCtx, x: number, y: number) {
  const { add, sprite, pos, text, onKeyPressRepeat } = ctx
  let current = 0
  let preview = add([sprite('tiles1', { frame: current }), pos(x, y)])
  const lbl = text ? add([text('', { size: 12 }), pos(x, y - 18)]) : null
  function updateLabel() {
    if (!text || !lbl) return
    const col = current % TILE1_COLS
    const row = Math.floor(current / TILE1_COLS)
    ;(lbl as any).text = `frame ${current} (c ${col}, r ${row})`
  }
  updateLabel()
  if (onKeyPressRepeat) {
    onKeyPressRepeat('left',  () => { current = (current + TILE1_COLS*TILE1_ROWS - 1) % (TILE1_COLS*TILE1_ROWS); preview.destroy(); preview = add([sprite('tiles1', { frame: current }), pos(x, y)]) ; updateLabel() })
    onKeyPressRepeat('right', () => { current = (current + 1) % (TILE1_COLS*TILE1_ROWS);           preview.destroy(); preview = add([sprite('tiles1', { frame: current }), pos(x, y)]) ; updateLabel() })
    onKeyPressRepeat('up',    () => { current = (current + TILE1_COLS) % (TILE1_COLS*TILE1_ROWS);  preview.destroy(); preview = add([sprite('tiles1', { frame: current }), pos(x, y)]) ; updateLabel() })
    onKeyPressRepeat('down',  () => { current = (current + TILE1_COLS*TILE1_ROWS - TILE1_COLS) % (TILE1_COLS*TILE1_ROWS); preview.destroy(); preview = add([sprite('tiles1', { frame: current }), pos(x, y)]) ; updateLabel() })
  }
}


