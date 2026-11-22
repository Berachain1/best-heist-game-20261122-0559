// The Midnight Vault — the alarm: fill on sightings, drain when hidden, lockdown.
// One job: turn "seen" into tension, and tension into a fair punishment.

import { TUNE } from './config.js';

export function makeAlarm() {
  return { level: 0, lockdown: false, lockdownT: 0, graceT: 0, seenNow: false };
}

// spotted: [{ by, closeness }] from guards and cameras this frame.
// Returns true when a lockdown just started.
export function updateAlarm(alarm, spotted, sneaking, dt, state) {
  alarm.seenNow = spotted.length > 0;

  if (alarm.lockdown) {
    alarm.lockdownT -= dt;
    if (alarm.lockdownT <= 0) {
      alarm.lockdown = false;
      alarm.level = 35;
      alarm.graceT = 2;
      state.message = 'Lockdown lifted — move quietly';
      state.messageT = 2.5;
    }
    return false;
  }

  if (alarm.graceT > 0) alarm.graceT -= dt;

  if (spotted.length > 0 && alarm.graceT <= 0) {
    for (const s of spotted) {
      const base = s.by === 'guard' ? TUNE.alarmGuardRate : TUNE.alarmCameraRate;
      const rate = base * (0.35 + 0.65 * s.closeness) * (sneaking ? 0.55 : 1);
      alarm.level += rate * dt;
    }
    if (alarm.level >= 100) {
      alarm.level = 100;
      alarm.lockdown = true;
      alarm.lockdownT = TUNE.lockdownSeconds;
      state.lockdowns += 1;
      state.score = Math.max(0, state.score - TUNE.lockdownPenalty);
      state.audio.lockdown();
      state.message = 'LOCKDOWN! Guards converge — hide until it lifts';
      state.messageT = 3;
      return true;
    }
  } else {
    alarm.level = Math.max(0, alarm.level - TUNE.alarmDrain * dt);
  }
  return false;
}
