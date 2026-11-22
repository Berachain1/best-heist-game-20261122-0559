// The Midnight Vault — the thief: movement, sneaking, and the three tools.
// One job: move the thief and spend coins, smoke and EMP.

import { ROOM_H, TUNE } from './config.js';
import { distractGuards } from './guards.js';
import { empNearestCamera } from './cameras.js';

export function makeThief(x, y) {
  return {
    x,
    y,
    angle: -Math.PI / 2,
    sneaking: false,
    moving: false,
    stepT: 0,
  };
}

function hitsSolid(x, y, solids) {
  const r = TUNE.thiefRadius - 2;
  for (const s of solids) {
    if (x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h) return true;
  }
  return false;
}

export function updateThief(thief, input, room, state, dt) {
  let dx = 0;
  let dy = 0;
  if (input.left) dx -= 1;
  if (input.right) dx += 1;
  if (input.up) dy -= 1;
  if (input.down) dy += 1;
  thief.moving = dx !== 0 || dy !== 0;
  thief.sneaking = !!input.sneak && thief.moving;

  if (thief.moving) {
    const len = Math.hypot(dx, dy);
    const speed = thief.sneaking ? TUNE.sneakSpeed : TUNE.walkSpeed;
    const nx = thief.x + (dx / len) * speed * dt;
    const ny = thief.y + (dy / len) * speed * dt;
    if (!hitsSolid(nx, thief.y, room.solids)) thief.x = nx;
    if (!hitsSolid(thief.x, ny, room.solids)) thief.y = ny;
    thief.x = Math.max(TUNE.thiefRadius + 26, Math.min(1280 - 26 - TUNE.thiefRadius, thief.x));
    thief.y = Math.max(TUNE.thiefRadius + 28, Math.min(ROOM_H - 28 - TUNE.thiefRadius, thief.y));
    thief.angle = Math.atan2(dy, dx);
    thief.stepT -= dt;
    if (thief.stepT <= 0) {
      thief.stepT = thief.sneaking ? 0.42 : 0.3;
      state.audio.step(thief.sneaking);
    }
  }

  // Mouse click: toss a coin at the clicked point to pull guards away.
  if (input.consumeClick() && state.coins > 0 && state.phase === 'play') {
    const p = input.mouseRoom();
    throwCoin(state, p.x, p.y);
  }
  if (input.consumeKey('KeyE') && state.smokeLeft > 0 && state.phase === 'play') {
    useSmoke(state);
  }
  if (input.consumeKey('KeyQ') && state.empLeft > 0 && state.phase === 'play') {
    useEmp(state);
  }
}

export function throwCoin(state, x, y) {
  state.coins -= 1;
  state.flyingCoins.push({ x0: state.thief.x, y0: state.thief.y, x, y, t: 0, dur: 0.45 });
  state.audio.coin();
  state.message = 'Coin tossed — guards turn to look';
  state.messageT = 2;
}

export function landCoin(state, coin) {
  state.landedCoins.push({ x: coin.x, y: coin.y, t: 1.2 });
  distractGuards(state.guards, coin.x, coin.y);
}

export function useSmoke(state) {
  state.smokeLeft -= 1;
  state.smokes.push({ x: state.thief.x, y: state.thief.y, r: 95, t: TUNE.smokeSeconds });
  state.audio.smoke();
  state.message = 'Smoke! No camera or guard can see through it';
  state.messageT = 2;
}

export function useEmp(state) {
  const cam = empNearestCamera(state.cameras, state.thief.x, state.thief.y);
  if (!cam) {
    state.message = 'EMP fizzles — no live camera nearby';
    state.messageT = 2;
    return;
  }
  state.empLeft -= 1;
  state.audio.emp();
  state.message = 'EMP! Nearest camera blind for 5 seconds';
  state.messageT = 2;
}
