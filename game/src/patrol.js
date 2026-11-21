// patrol.js — guard behaviour, one job: walk, watch, chase, give up.
// A guard walks its waypoint loop, pauses at each corner, and turns its head.
// When it sees the thief its suspicion rises; full suspicion is an alarm and
// a chase. Break line of sight and stay hidden, and the guard calms down and
// walks back to its route.

import { TILE, tileCenter, walkable } from './level.js';
import { seenStrength } from './vision.js';

const PATROL_SPEED = 1.5;
const CHASE_SPEED = 2.3;
const RETURN_SPEED = 1.8;

// Waypoint loops, in tile coordinates. Each loop is a rectangle of open floor.
export const LOOPS = [
  [
    { col: 9, row: 5 },
    { col: 9, row: 8 },
    { col: 4, row: 8 },
    { col: 4, row: 5 },
  ],
  [
    { col: 16, row: 5 },
    { col: 16, row: 8 },
    { col: 14, row: 8 },
    { col: 14, row: 5 },
  ],
  [
    { col: 12, row: 10 },
    { col: 12, row: 7 },
    { col: 8, row: 7 },
    { col: 8, row: 10 },
  ],
];

export class Guard {
  constructor(loopIndex) {
    const loop = LOOPS[loopIndex];
    const start = tileCenter(loop[0].col, loop[0].row);
    this.x = start.x;
    this.y = start.y;
    this.loop = loop;
    this.target = 1;
    this.facing = 0;
    this.pause = 0;
    this.suspicion = 0; // 0..100, shared with the whole garden's alarm
    this.mode = 'patrol'; // patrol | chase | return
    this.chaseMemory = null; // last seen thief position while chasing
  }

  // Move toward (tx, ty) at speed, stopping on walls; returns arrived.
  stepToward(tx, ty, speed) {
    const dx = tx - this.x;
    const dy = ty - this.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return true;
    const nx = this.x + (dx / dist) * speed;
    const ny = this.y + (dy / dist) * speed;
    this.facing = Math.atan2(dy, dx);
    if (walkable(Math.floor(nx / TILE), Math.floor(this.y / TILE))) this.x = nx;
    if (walkable(Math.floor(this.x / TILE), Math.floor(ny / TILE))) this.y = ny;
    return Math.hypot(tx - this.x, ty - this.y) < 3;
  }

  update(thief, alarmOn, onSpotted) {
    const strength = seenStrength(this, thief);
    if (strength > 0) {
      // Seen: suspicion climbs fast up close, slower at the cone's edge.
      this.suspicion = Math.min(100, this.suspicion + strength * 2.2);
      this.chaseMemory = { x: thief.x, y: thief.y };
      if (this.suspicion >= 100 && !alarmOn) onSpotted();
    } else {
      this.suspicion = Math.max(0, this.suspicion - (alarmOn ? 0.25 : 0.9));
    }

    if (alarmOn) {
      this.mode = 'chase';
      if (this.chaseMemory) {
        this.stepToward(this.chaseMemory.x, this.chaseMemory.y, CHASE_SPEED);
        // Give up the chase if the thief has been out of sight a while.
        if (strength === 0 && this.suspicion < 30) {
          this.mode = 'return';
          this.chaseMemory = null;
        }
      }
      return;
    }

    if (this.mode === 'return') {
      const home = tileCenter(this.loop[0].col, this.loop[0].row);
      if (this.stepToward(home.x, home.y, RETURN_SPEED)) {
        this.mode = 'patrol';
        this.target = 1;
      }
      return;
    }

    // Patrol: walk to the next corner, pause, look around.
    if (this.pause > 0) {
      this.pause--;
      this.facing += 0.02; // scanning the garden while waiting
      return;
    }
    const wp = tileCenter(this.loop[this.target].col, this.loop[this.target].row);
    if (this.stepToward(wp.x, wp.y, PATROL_SPEED)) {
      this.target = (this.target + 1) % this.loop.length;
      this.pause = 45;
    }
  }
}
