// thief.js — the player, one job: move and steal lanterns.
// Arrow keys / WASD move; a mouse click sets a walk target instead. The thief
// slides along walls, hides inside hedge tiles, and picks up a lantern by
// touching it. Stepping makes a soft sound every few frames.

import { findTiles, pointInHedge, pointInWall, TILE, tileCenter } from './level.js';

const SPEED = 3.0;
const RADIUS = 14;

export class Thief {
  constructor(sound) {
    const start = tileCenter(findTiles('P')[0].col, findTiles('P')[0].row);
    this.x = start.x;
    this.y = start.y;
    this.sound = sound;
    this.target = null; // mouse walk target {x, y} or null
    this.stepClock = 0;
    this.stepAlt = false;
    this.hidden = false;
    this.moving = false;
  }

  reset() {
    const start = tileCenter(findTiles('P')[0].col, findTiles('P')[0].row);
    this.x = start.x;
    this.y = start.y;
    this.target = null;
    this.hidden = false;
    this.moving = false;
  }

  // Circle-vs-wall test at the new position; axis separated so the thief
  // slides along a wall instead of sticking to it.
  blockedAt(x, y) {
    for (const [ox, oy] of [[-RADIUS, -RADIUS], [RADIUS, -RADIUS], [-RADIUS, RADIUS], [RADIUS, RADIUS]]) {
      if (pointInWall(x + ox, y + oy)) return true;
    }
    return false;
  }

  move(dx, dy) {
    if (dx === 0 && dy === 0) return;
    const len = Math.hypot(dx, dy);
    const nx = this.x + (dx / len) * SPEED;
    const ny = this.y + (dy / len) * SPEED;
    if (!this.blockedAt(nx, this.y)) this.x = nx;
    if (!this.blockedAt(this.x, ny)) this.y = ny;
    this.moving = true;
    this.stepClock++;
    if (this.stepClock >= 14) {
      this.stepClock = 0;
      this.stepAlt = !this.stepAlt;
      this.sound.step(this.stepAlt);
    }
  }

  update(input) {
    this.moving = false;
    if (input.click) {
      // A click below the HUD walks the thief there; a click on a wall tile
      // is ignored by the wall test in move().
      this.target = { x: input.click.x, y: input.click.y - 48 };
      input.click = null;
    }
    let dx = 0;
    let dy = 0;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (dx !== 0 || dy !== 0) {
      this.target = null;
      this.move(dx, dy);
    } else if (this.target) {
      const tx = this.target.x - this.x;
      const ty = this.target.y - this.y;
      if (Math.hypot(tx, ty) < 4) {
        this.target = null;
      } else {
        this.move(tx, ty);
      }
    }
    this.hidden = pointInHedge(this.x, this.y);
  }

  // Lanterns the thief is touching. The game removes them and counts them.
  touchingLanterns(lanterns) {
    return lanterns.filter((l) => Math.hypot(l.x - this.x, l.y - this.y) < 26);
  }
}

export function lanternStarts() {
  return findTiles('L').map((t) => {
    const c = tileCenter(t.col, t.row);
    return { x: c.x, y: c.y, taken: false };
  });
}

export function gateSpot() {
  const g = findTiles('G')[0];
  return tileCenter(g.col, g.row);
}
