// boot.js — the game loop and state machine, one job: run the game.
// States: title -> play -> win / caught. The garden alarm is shared: the
// highest guard suspicion drives it. Catching happens when a guard touches
// the thief during an alarm. A `shot` URL parameter poses the game for
// screenshots: title, patrol, alarm, or win.

import { createInput } from './keys.js';
import { createSound } from './sound.js';
import { Guard } from './patrol.js';
import { gateSpot, lanternStarts, Thief } from './thief.js';
import { CANVAS_H, CANVAS_W, drawGame } from './draw.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');

const input = createInput(canvas);
const sound = createSound();

const game = {
  state: 'title',
  frame: 0,
  time: 0,
  suspicion: 0,
  alarm: false,
  thief: null,
  guards: [],
  lanterns: [],
  gate: null,
  gateOpen: false,
  alarmSounded: false,
  thumpClock: 0,
};

function freshRun() {
  game.thief = new Thief(sound);
  game.guards = [new Guard(0), new Guard(1), new Guard(2)];
  game.lanterns = lanternStarts();
  game.gate = gateSpot();
  game.gateOpen = false;
  game.suspicion = 0;
  game.alarm = false;
  game.time = 0;
  game.alarmSounded = false;
}

function startPlay() {
  freshRun();
  game.state = 'play';
}

function poseShot(shot) {
  freshRun();
  if (shot === 'title') {
    game.state = 'title';
    return;
  }
  if (shot === 'win') {
    game.lanterns.forEach((l) => (l.taken = true));
    game.gateOpen = true;
    game.thief.x = game.gate.x - 90;
    game.thief.y = game.gate.y;
    game.state = 'win';
    game.time = 143;
    return;
  }
  game.state = 'play';
  if (shot === 'alarm') {
    // Thief caught in guard 1's cone, alarm just raised.
    game.thief.x = 9 * 56 + 28;
    game.thief.y = 6 * 56 + 28;
    game.guards[0].suspicion = 100;
    game.suspicion = 100;
    game.alarm = true;
    game.guards[0].chaseMemory = { x: game.thief.x, y: game.thief.y };
    game.guards[0].mode = 'chase';
  } else {
    // Patrol shot: thief slipping past the first hedge row.
    game.thief.x = 3 * 56 + 28;
    game.thief.y = 2 * 56 + 28;
    game.guards[0].x = 9 * 56 + 28;
    game.guards[0].y = 7 * 56 + 28;
    game.guards[0].facing = Math.PI / 2;
  }
}

function tick() {
  game.frame++;
  if (input.restart) {
    input.restart = false;
    startPlay();
  }

  if (game.state === 'title') {
    if (input.confirm) {
      input.confirm = false;
      startPlay();
    }
    drawGame(ctx, game);
    requestAnimationFrame(tick);
    return;
  }

  if (game.state === 'win' || game.state === 'caught') {
    drawGame(ctx, game);
    requestAnimationFrame(tick);
    return;
  }

  // Play.
  game.time += 1 / 60;
  game.thief.update(input);

  const wasAlarm = game.alarm;
  for (const g of game.guards) {
    g.update(game.thief, game.alarm, () => {
      game.alarm = true;
    });
  }
  game.suspicion = Math.max(...game.guards.map((g) => g.suspicion));
  if (game.alarm && !wasAlarm && !game.alarmSounded) {
    game.alarmSounded = true;
    sound.alarm();
  }
  if (!game.alarm) game.alarmSounded = false;
  if (game.alarm && game.suspicion < 25) game.alarm = false;

  // A guard close by thumps a warning beat.
  game.thumpClock++;
  if (game.thumpClock >= 30) {
    game.thumpClock = 0;
    const near = game.guards.some((g) => Math.hypot(g.x - game.thief.x, g.y - game.thief.y) < 150);
    if (near && game.suspicion > 40) sound.thump();
  }

  // Lanterns.
  for (const l of game.thief.touchingLanterns(game.lanterns)) {
    if (!l.taken) {
      l.taken = true;
      sound.pickup();
    }
  }
  if (!game.gateOpen && game.lanterns.every((l) => l.taken)) {
    game.gateOpen = true;
  }

  // Caught: a guard touches the thief while the alarm is up.
  if (game.alarm) {
    const caught = game.guards.some((g) => Math.hypot(g.x - game.thief.x, g.y - game.thief.y) < 26);
    if (caught) game.state = 'caught';
  }

  // Escaped: reach the open gate.
  if (game.gateOpen && Math.hypot(game.gate.x - game.thief.x, game.gate.y - game.thief.y) < 30) {
    game.state = 'win';
    sound.win();
  }

  drawGame(ctx, game);
  requestAnimationFrame(tick);
}

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  poseShot(shot);
} else {
  freshRun();
}
drawGame(ctx, game);
requestAnimationFrame(tick);
