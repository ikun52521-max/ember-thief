// level.js — the garden map and tile queries.
// One job: know the map. Tiles are 56px. Legend: '#' wall, 'H' hedge (blocks
// sight and hides the thief), '.' floor, 'L' lantern, 'G' gate, 'P' thief start,
// '1'/'2'/'3' guard starts. Guards patrol the waypoint loops in patrol.js.

export const TILE = 56;
export const COLS = 20;
export const ROWS = 13;

const MAP = [
  '####################',
  '#P....#....H.....L.#',
  '#.....#....H.......#',
  '#.##..#..##...##...#',
  '#.....H.....#......#',
  '#..H..H..1..#...2..#',
  '#.....#.....#......#',
  '#.##.....##....##..#',
  '#....H......H......#',
  '#..L...#..H....#...#',
  '#......#....3......#',
  '#.H.G..#....H...L..#',
  '####################',
];

export const MAP_ROWS = MAP;

export function tileAt(col, row) {
  if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return '#';
  return MAP[row][col];
}

export function isWall(col, row) {
  return tileAt(col, row) === '#';
}

export function isHedge(col, row) {
  return tileAt(col, row) === 'H';
}

// A tile blocks a guard's line of sight.
export function blocksSight(col, row) {
  const t = tileAt(col, row);
  return t === '#' || t === 'H';
}

// A tile the thief or a guard may walk through.
export function walkable(col, row) {
  return tileAt(col, row) !== '#' && tileAt(col, row) !== 'H';
}

export function tileCenter(col, row) {
  return { x: col * TILE + TILE / 2, y: row * TILE + TILE / 2 };
}

export function findTiles(ch) {
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (MAP[r][c] === ch) out.push({ col: c, row: r });
    }
  }
  return out;
}

// Pixel point (x, y) inside a wall tile?
export function pointInWall(x, y) {
  return isWall(Math.floor(x / TILE), Math.floor(y / TILE));
}

export function pointInHedge(x, y) {
  return isHedge(Math.floor(x / TILE), Math.floor(y / TILE));
}
