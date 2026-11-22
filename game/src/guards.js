// The Midnight Vault — guards: patrols, suspicion, investigation, lockdown chase.
// One job: move the guards and say who is looking at the thief.

import { TUNE } from './config.js';
import { angleTo, eyeSees, turnToward } from './vision.js';

export function makeGuards(defs) {
  return defs.map((d) => ({
    x: d.x,
    y: d.y,
    angle: 0,
    waypoints: d.waypoints,
    wpIndex: 1 % d.waypoints.length,
    pause: d.pause || 1,
    pauseT: 0,
    mode: 'patrol',
    investigateX: 0,
    investigateY: 0,
    investigateT: 0,
    alert: 0,
  }));
}

function moveToward(g, tx, ty, speed, dt, solids) {
  const dx = tx - g.x;
  const dy = ty - g.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 2) return true;
  const step = Math.min(dist, speed * dt);
  const nx = g.x + (dx / dist) * step;
  const ny = g.y + (dy / dist) * step;
  if (!hitsSolid(nx, g.y, solids)) g.x = nx;
  if (!hitsSolid(g.x, ny, solids)) g.y = ny;
  g.angle = turnToward(g.angle, angleTo(g.x, g.y, tx, ty), 6 * dt);
  return dist - step < 4;
}

function hitsSolid(x, y, solids) {
  const r = TUNE.guardRadius - 2;
  for (const s of solids) {
    if (x + r > s.x && x - r < s.x + s.w && y + r > s.y && y - r < s.y + s.h) return true;
  }
  return false;
}

export function updateGuards(guards, thief, room, state, dt) {
  const spotted = [];
  const solids = room.solids;
  const smokes = state.smokes;

  for (const g of guards) {
    const range = g.mode === 'chase' ? TUNE.coneRange + 45 : TUNE.coneRange;
    const seen = eyeSees(g.x, g.y, g.angle, range, TUNE.coneHalf, thief.x, thief.y, solids, smokes);

    if (seen.seen && state.phase === 'play' && !state.lockdown) {
      g.alert = Math.min(1, g.alert + dt * 1.4);
      spotted.push({ by: 'guard', closeness: seen.closeness, guard: g });
    } else {
      g.alert = Math.max(0, g.alert - dt * 0.4);
    }

    if (state.lockdown) {
      g.mode = 'chase';
      moveToward(g, thief.x, thief.y, TUNE.guardChase, dt, solids);
      continue;
    }

    if (g.mode === 'chase') {
      if (g.alert <= 0.05) g.mode = 'patrol';
      else moveToward(g, thief.x, thief.y, TUNE.guardChase, dt, solids);
      continue;
    }

    if (g.mode === 'investigate') {
      const arrived = moveToward(g, g.investigateX, g.investigateY, TUNE.guardInvestigate, dt, solids);
      g.investigateT -= dt;
      if (arrived || g.investigateT <= 0) {
        g.mode = 'patrol';
        g.pauseT = 1.2;
      }
      continue;
    }

    if (g.alert > 0.55) {
      g.mode = 'chase';
      continue;
    }

    if (g.pauseT > 0) {
      g.pauseT -= dt;
      g.angle += Math.sin(state.t * 1.4 + g.x) * 0.35 * dt;
      continue;
    }

    const target = g.waypoints[g.wpIndex];
    const arrived = moveToward(g, target[0], target[1], TUNE.guardPatrol, dt, solids);
    if (arrived) {
      g.wpIndex = (g.wpIndex + 1) % g.waypoints.length;
      g.pauseT = g.pause;
    }
  }
  return spotted;
}

// A tossed coin pulls nearby guards to its landing spot.
export function distractGuards(guards, x, y) {
  for (const g of guards) {
    if (Math.hypot(g.x - x, g.y - y) <= TUNE.coinLureRadius) {
      g.mode = 'investigate';
      g.investigateX = x;
      g.investigateY = y;
      g.investigateT = TUNE.coinInvestigateSeconds;
      g.alert = Math.max(0, g.alert - 0.3);
    }
  }
}
