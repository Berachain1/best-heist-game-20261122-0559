// The Midnight Vault — the game loop: state, rooms, loot, exit, win and loss.
// One job: wire every module together and run the heist.

import { ROOM_H, TOOL_START, TUNE, VIEW } from './config.js';
import { buildRoom, roomCount } from './rooms.js';
import { makeGuards, updateGuards } from './guards.js';
import { cameraSpots, makeCameras, updateCameras } from './cameras.js';
import { landCoin, makeThief, updateThief } from './thief.js';
import { makeAlarm, updateAlarm } from './alarm.js';
import { makeAudio } from './audio.js';
import { makeInput } from './input.js';
import { drawGame } from './render.js';
import { applyShot, parseShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = VIEW.w;
canvas.height = VIEW.h;

const input = makeInput(canvas);
const audio = makeAudio();

const state = {
  t: 0,
  phase: 'title',
  roomIndex: 0,
  room: null,
  thief: null,
  guards: [],
  cameras: [],
  alarm: makeAlarm(),
  score: 0,
  lootGot: false,
  coins: TOOL_START.coins,
  smokeLeft: TOOL_START.smokePerRoom,
  empLeft: TOOL_START.empPerRun,
  timeLeft: 120,
  message: '',
  messageT: 0,
  flyingCoins: [],
  landedCoins: [],
  smokes: [],
  coinSpots: [],
  lockdowns: 0,
  roomClearT: 0,
  audio,
  input,
};

state.loadRoom = function loadRoom(index) {
  state.roomIndex = index;
  state.room = buildRoom(index);
  state.thief = makeThief(state.room.start.x, state.room.start.y);
  state.guards = makeGuards(state.room.guards);
  state.cameras = makeCameras(state.room.cameras);
  state.alarm = makeAlarm();
  state.lootGot = false;
  state.smokeLeft = TOOL_START.smokePerRoom;
  state.timeLeft = state.room.timeLimit;
  state.flyingCoins = [];
  state.landedCoins = [];
  state.smokes = [];
  state.coinSpots = state.room.coinSpots.map((c) => ({ ...c, taken: false }));
  state.message = `Room ${index + 1}/3 — ${state.room.name}: steal the ${state.room.loot.label}`;
  state.messageT = 3;
};

function grabLootIfClose() {
  if (state.lootGot) return;
  const p = state.room.lootPos;
  if (Math.hypot(state.thief.x - p.x, state.thief.y - p.y) <= TUNE.grabRadius) {
    state.lootGot = true;
    state.score += state.room.loot.value;
    state.phase = 'roomclear';
    state.roomClearT = 1.6;
    audio.pickup();
    state.message = `${state.room.loot.label} secured — get to the EXIT!`;
    state.messageT = 3;
  }
}

function pickUpCoins() {
  for (const c of state.coinSpots) {
    if (!c.taken && Math.hypot(state.thief.x - c.x, state.thief.y - c.y) <= 26) {
      c.taken = true;
      state.coins += 1;
      audio.coin();
      state.message = 'Found a coin — one more distraction';
      state.messageT = 2;
    }
  }
}

function exitIfThere() {
  if (!state.lootGot) return;
  const e = state.room.exit;
  const cx = e.x + e.w / 2;
  const cy = e.y + e.h / 2;
  if (Math.hypot(state.thief.x - cx, state.thief.y - cy) <= TUNE.exitRadius) {
    if (state.roomIndex + 1 >= roomCount()) {
      state.phase = 'win';
      audio.win();
      return;
    }
    audio.roomClear();
    state.loadRoom(state.roomIndex + 1);
  }
}

function update(dt) {
  state.t += dt;
  if (state.messageT > 0) state.messageT -= dt;

  if (state.phase === 'title') {
    if (input.consumeAnyKey()) {
      audio.unlock();
      state.phase = 'play';
      state.loadRoom(0);
    }
    return;
  }
  if (state.phase === 'win' || state.phase === 'timeout') {
    if (input.consumeKey('KeyR')) {
      state.score = 0;
      state.coins = TOOL_START.coins;
      state.empLeft = TOOL_START.empPerRun;
      state.lockdowns = 0;
      state.phase = 'play';
      state.loadRoom(0);
    }
    return;
  }
  if (state.phase === 'roomclear') {
    state.roomClearT -= dt;
    if (state.roomClearT <= 0) state.phase = 'play';
    return;
  }

  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    state.phase = 'timeout';
    state.score = Math.max(0, state.score - TUNE.timeoutPenalty);
    return;
  }

  updateThief(state.thief, input, state.room, state, dt);
  updateCameras(state.cameras, state.t, dt);
  for (const f of state.flyingCoins) f.t += dt;
  const landed = state.flyingCoins.filter((f) => f.t >= f.dur);
  state.flyingCoins = state.flyingCoins.filter((f) => f.t < f.dur);
  for (const f of landed) landCoin(state, f);
  for (const c of state.landedCoins) c.t -= dt;
  state.landedCoins = state.landedCoins.filter((c) => c.t > 0);
  for (const s of state.smokes) s.t -= dt;
  state.smokes = state.smokes.filter((s) => s.t > 0);

  const spotted = [
    ...updateGuards(state.guards, state.thief, state.room, state, dt),
    ...cameraSpots(state.cameras, state.thief, state.room, state.smokes),
  ];
  const wasSeen = state.alarm.seenNow;
  updateAlarm(state.alarm, spotted, state.thief.sneaking, dt, state);
  if (state.alarm.seenNow && !wasSeen) audio.spotted();

  grabLootIfClose();
  pickUpCoins();
  exitIfThere();
}

const shot = parseShot();
const shotMode = !!shot.shot;
state.loadRoom(0);
if (shotMode) {
  applyShot(state, shot.shot);
}

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (window.__heistTestDone) {
    requestAnimationFrame(frame);
    return;
  }
  if (!shotMode) update(dt);
  drawGame(ctx, state);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// In-browser self-test: ?test=1 runs checks and paints the verdict.
if (new URLSearchParams(window.location.search).get('test') === '1') {
  window.__heistTest = runSelfTest();
}

function runSelfTest() {
  const results = [];
  function check(name, ok) {
    results.push({ name, ok: !!ok });
  }
  state.loadRoom(0);
  state.phase = 'play';
  check('room 0 loads with 2 guards and 1 camera', state.guards.length === 2 && state.cameras.length === 1);
  check('loot reachable: thief can stand within grab radius', (() => {
    const p = state.room.lootPos;
    state.thief.x = p.x;
    state.thief.y = p.y + 40;
    return Math.hypot(state.thief.x - p.x, state.thief.y - p.y) <= 60;
  })());
  state.loadRoom(1);
  state.phase = 'play';
  check('room 1 loads with 3 guards and 2 cameras', state.guards.length === 3 && state.cameras.length === 2);
  check('room 1 loot reachable', (() => {
    const p = state.room.lootPos;
    return Math.hypot(state.thief.x - p.x, state.thief.y - p.y) > 0 && state.room.solids.every((s) => !(p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h));
  })());
  state.loadRoom(2);
  state.phase = 'play';
  check('room 2 loads with 3 guards and 2 cameras', state.guards.length === 3 && state.cameras.length === 2);
  check('room 2 loot reachable', (() => {
    const p = state.room.lootPos;
    return state.room.solids.every((s) => !(p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h));
  })());
  // Alarm fills when a guard sees the thief, drains when hidden.
  state.loadRoom(0);
  state.phase = 'play';
  state.thief.x = state.guards[0].x + 60;
  state.thief.y = state.guards[0].y;
  state.guards[0].angle = 0;
  updateAlarm(state.alarm, [{ by: 'guard', closeness: 0.8 }], false, 1, state);
  check('alarm fills on sighting', state.alarm.level > 20);
  updateAlarm(state.alarm, [], false, 5, state);
  check('alarm drains when hidden', state.alarm.level < 30);
  // Lockdown at 100.
  state.alarm.level = 99;
  updateAlarm(state.alarm, [{ by: 'guard', closeness: 1 }], false, 0.5, state);
  check('lockdown triggers at 100', state.alarm.lockdown === true);
  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok);
  // Paint the verdict over the canvas for the screenshot run.
  const boxH = 60 + results.length * 24;
  ctx.fillStyle = 'rgba(5,7,16,0.92)';
  ctx.fillRect(0, 0, VIEW.w, boxH);
  ctx.fillStyle = failed.length === 0 ? '#4ade80' : '#ff5252';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SELF-TEST ${passed}/${results.length} PASSED`, 20, 50);
  ctx.font = '16px sans-serif';
  results.forEach((r, i) => {
    ctx.fillStyle = r.ok ? '#4ade80' : '#ff5252';
    ctx.fillText(`${r.ok ? 'PASS' : 'FAIL'} — ${r.name}`, 20, 84 + i * 24);
  });
  console.log('HEIST SELF-TEST', JSON.stringify(results));
  window.__heistTestDone = true;
  return results;
}

window.__heist = state;
