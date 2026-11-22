// The Midnight Vault — security cameras: sweeping arcs, blind spots, EMP.
// One job: sweep each camera and say when one has the thief in frame.

import { TUNE } from './config.js';
import { eyeSees } from './vision.js';

export function makeCameras(defs) {
  return defs.map((d) => ({
    x: d.x,
    y: d.y,
    base: d.base,
    sweep: d.sweep,
    speed: d.speed,
    range: d.range || TUNE.cameraRange,
    angle: d.base,
    disabledT: 0,
    blink: Math.random() * 6,
  }));
}

export function updateCameras(cameras, t, dt) {
  for (const c of cameras) {
    if (c.disabledT > 0) c.disabledT = Math.max(0, c.disabledT - dt);
    c.angle = c.base + Math.sin(t * c.speed) * c.sweep;
  }
}

// Returns the cameras that currently see the thief.
export function cameraSpots(cameras, thief, room, smokes) {
  const seen = [];
  for (const c of cameras) {
    if (c.disabledT > 0) continue;
    const hit = eyeSees(c.x, c.y, c.angle, c.range, TUNE.cameraHalf, thief.x, thief.y, room.solids, smokes);
    if (hit.seen) seen.push({ by: 'camera', closeness: hit.closeness, camera: c });
  }
  return seen;
}

// EMP: knock out the nearest live camera for a few seconds.
export function empNearestCamera(cameras, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const c of cameras) {
    if (c.disabledT > 0) continue;
    const d = Math.hypot(c.x - x, c.y - y);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  if (!best) return null;
  best.disabledT = TUNE.empSeconds;
  return best;
}
