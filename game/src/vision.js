// vision.js — what a guard can see, one job: cones and line of sight.
// A guard sees the thief when the thief is inside the cone's range and angle
// and the straight line between them crosses no wall or hedge tile.

import { blocksSight, pointInHedge, TILE } from './level.js';

export const CONE_RANGE = 190;
export const CONE_HALF_ANGLE = 0.55; // radians, about 31 degrees each side

// True when no wall or hedge tile lies on the segment (x0,y0)-(x1,y1).
export function lineOfSight(x0, y0, x1, y1) {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const col = Math.floor((x0 + dx * t) / TILE);
    const row = Math.floor((y0 + dy * t) / TILE);
    if (blocksSight(col, row)) return false;
  }
  return true;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// How strongly a guard sees the thief right now: 0 = not seen, up to 1 when
// the thief is close and dead centre in the cone. 0 when hidden in a hedge.
export function seenStrength(guard, thief) {
  if (pointInHedge(thief.x, thief.y)) return 0;
  const dx = thief.x - guard.x;
  const dy = thief.y - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist > CONE_RANGE) return 0;
  const ang = Math.atan2(dy, dx);
  if (Math.abs(angleDiff(ang, guard.facing)) > CONE_HALF_ANGLE) return 0;
  if (!lineOfSight(guard.x, guard.y, thief.x, thief.y)) return 0;
  // Closer and more central is easier to spot.
  const rangePart = 1 - dist / CONE_RANGE;
  const anglePart = 1 - Math.abs(angleDiff(ang, guard.facing)) / CONE_HALF_ANGLE;
  return 0.35 + 0.65 * (rangePart * 0.6 + anglePart * 0.4);
}
