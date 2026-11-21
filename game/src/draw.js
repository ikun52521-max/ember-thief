// draw.js — everything the eye sees, one job: paint the garden.
// The canvas is 1120 wide; a 48px HUD bar sits on top and the 20x13 garden
// (56px tiles) fills the rest. Guards get glowing vision cones, hedges are
// dark bushes, lanterns glow, and the gate shines when it opens.

import { COLS, isHedge, isWall, ROWS, TILE } from './level.js';
import { CONE_HALF_ANGLE, CONE_RANGE } from './vision.js';

export const HUD_H = 48;
export const CANVAS_W = COLS * TILE;
export const CANVAS_H = HUD_H + ROWS * TILE;

function conePath(ctx, guard) {
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y);
  ctx.arc(
    guard.x,
    guard.y,
    CONE_RANGE,
    guard.facing - CONE_HALF_ANGLE,
    guard.facing + CONE_HALF_ANGLE,
  );
  ctx.closePath();
}

export function drawGame(ctx, game) {
  const { thief, guards, lanterns, gate, gateOpen, alarm, suspicion, time, state } = game;

  // Night sky background and HUD bar.
  ctx.fillStyle = '#0b1020';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#141b30';
  ctx.fillRect(0, 0, CANVAS_W, HUD_H);

  ctx.save();
  ctx.translate(0, HUD_H);

  // Garden floor: a quiet checker of mossy stone.
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * TILE;
      const y = r * TILE;
      if (isWall(c, r)) {
        ctx.fillStyle = '#2c3247';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#3a4159';
        ctx.fillRect(x, y, TILE, 5);
      } else if (isHedge(c, r)) {
        ctx.fillStyle = '#1d2b1a';
        ctx.fillRect(x, y, TILE, TILE);
        ctx.fillStyle = '#2f4a26';
        ctx.beginPath();
        ctx.arc(x + 16, y + 20, 13, 0, Math.PI * 2);
        ctx.arc(x + 38, y + 16, 14, 0, Math.PI * 2);
        ctx.arc(x + 28, y + 38, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#40632f';
        ctx.beginPath();
        ctx.arc(x + 22, y + 26, 5, 0, Math.PI * 2);
        ctx.arc(x + 36, y + 34, 4, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = (c + r) % 2 === 0 ? '#232c26' : '#202720';
        ctx.fillRect(x, y, TILE, TILE);
      }
    }
  }

  // The gate: barred iron while shut, a green glow once it opens.
  ctx.fillStyle = gateOpen ? '#2fae5f' : '#5a4632';
  ctx.fillRect(gate.x - 20, gate.y - 20, 40, 40);
  ctx.fillStyle = gateOpen ? '#8cffab' : '#8a6d4b';
  for (let i = -1; i <= 1; i++) ctx.fillRect(gate.x + i * 12 - 2, gate.y - 20, 4, 40);
  if (gateOpen) {
    ctx.fillStyle = 'rgba(120,255,160,0.25)';
    ctx.beginPath();
    ctx.arc(gate.x, gate.y, 34, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lanterns not yet stolen: warm light on the ground.
  for (const l of lanterns) {
    if (l.taken) continue;
    const flicker = 0.75 + 0.25 * Math.sin(game.frame * 0.08 + l.x);
    ctx.fillStyle = `rgba(255,190,60,${0.18 * flicker})`;
    ctx.beginPath();
    ctx.arc(l.x, l.y, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffbe3c';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(l.x, l.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // Guard vision cones, then the guards themselves.
  for (const g of guards) {
    ctx.fillStyle = g.mode === 'chase' ? 'rgba(255,70,60,0.20)' : 'rgba(255,220,90,0.16)';
    conePath(ctx, g);
    ctx.fill();
    ctx.fillStyle = g.mode === 'chase' ? '#ff463c' : '#c94f43';
    ctx.beginPath();
    ctx.arc(g.x, g.y, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd9d4';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.facing) * 8, g.y + Math.sin(g.facing) * 8, 5, 0, Math.PI * 2);
    ctx.fill();
    if (g.suspicion > 25) {
      ctx.fillStyle = g.suspicion >= 100 ? '#ff463c' : '#ffcf3c';
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.suspicion >= 100 ? '!' : '?', g.x, g.y - 22);
    }
  }

  // The thief: a teal cloak, and his own small lantern light.
  ctx.fillStyle = 'rgba(90,220,200,0.18)';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 30, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = thief.hidden ? '#3f8f7a' : '#2fd4b8';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0b1020';
  ctx.beginPath();
  ctx.arc(thief.x - 4, thief.y - 3, 2, 0, Math.PI * 2);
  ctx.arc(thief.x + 4, thief.y - 3, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // HUD: title, lanterns, suspicion bar, time, alarm word.
  ctx.fillStyle = '#e8ecf5';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EMBER THIEF', 14, 30);
  const got = lanterns.filter((l) => l.taken).length;
  ctx.fillStyle = '#ffbe3c';
  ctx.fillText(`Lanterns ${got} / ${lanterns.length}`, 190, 30);
  ctx.fillStyle = '#e8ecf5';
  ctx.fillText(gateOpen ? 'GATE OPEN — RUN!' : 'Steal 3 lanterns, reach the gate', 345, 30);
  ctx.fillStyle = '#8b93a7';
  ctx.fillText(`${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`, 1010, 30);

  // Suspicion bar under the HUD text.
  ctx.fillStyle = '#2c3247';
  ctx.fillRect(620, 14, 180, 12);
  ctx.fillStyle = suspicion >= 100 ? '#ff463c' : suspicion > 40 ? '#ffcf3c' : '#2fd4b8';
  ctx.fillRect(620, 14, 180 * (suspicion / 100), 12);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '13px sans-serif';
  ctx.fillText(alarm ? 'SPOTTED!' : 'seen', 806, 25);

  if (state === 'title') {
    overlay(ctx, 'EMBER THIEF', 'A lantern garden at night. Three guards walk the paths,', 'their lantern-light cones sweeping the moss. Steal 3 lanterns,', 'hide in the hedges, and slip out the gate unseen.', 'WASD / arrows to move — click to walk — R to restart', 'Press Enter to begin');
  } else if (state === 'win') {
    overlay(ctx, 'YOU VANISHED INTO THE NIGHT', `All 3 lanterns stolen in ${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}.`, 'The guards are still looking at an empty garden.', '', 'Press R to steal again');
  } else if (state === 'caught') {
    overlay(ctx, 'CAUGHT IN THE LIGHT', 'A guard laid a hand on your shoulder.', 'The garden keeps its lanterns tonight.', '', 'Press R to try again');
  }
}

function overlay(ctx, title, ...lines) {
  ctx.fillStyle = 'rgba(5,8,18,0.78)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffbe3c';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title, CANVAS_W / 2, 250);
  ctx.fillStyle = '#e8ecf5';
  ctx.font = '19px sans-serif';
  lines.forEach((line, i) => {
    if (line) ctx.fillText(line, CANVAS_W / 2, 310 + i * 32);
  });
}
