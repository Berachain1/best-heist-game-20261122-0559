// The Midnight Vault — deterministic screenshot states (?shot=…&seed=1).
// One job: pose the game for each judged frame, the same way every run.

export function parseShot() {
  const params = new URLSearchParams(window.location.search);
  return { shot: params.get('shot') || null, seed: Number(params.get('seed') || 1) };
}

// Pose a fully-built state for one screenshot. All four frames are peak
// gameplay: thief, guards with cones, a camera, gold loot and the alarm meter.
export function applyShot(state, name) {
  const s = state;
  s.phase = 'play';
  s.t = 1.0;
  s.messageT = 0;

  if (name === 'cover') {
    s.roomIndex = 0;
    s.loadRoom(0);
    s.thief.x = 470;
    s.thief.y = 300;
    s.thief.angle = Math.PI / 4;
    s.guards[0].x = 620;
    s.guards[0].y = 250;
    s.guards[0].angle = -Math.PI / 2;
    s.guards[1].x = 920;
    s.guards[1].y = 470;
    s.guards[1].angle = Math.PI;
    s.cameras[0].angle = Math.PI / 2 + 0.45;
    s.alarm.level = 0;
    s.score = 0;
    s.timeLeft = 118;
    s.message = 'Stay out of the red cones — grab the painting, then reach the EXIT';
    s.messageT = 99;
    return;
  }

  if (name === 'blindspot') {
    s.roomIndex = 0;
    s.loadRoom(0);
    s.thief.x = 760;
    s.thief.y = 320;
    s.thief.angle = 0;
    s.thief.sneaking = true;
    s.guards[0].x = 500;
    s.guards[0].y = 250;
    s.guards[0].angle = Math.PI;
    s.guards[1].x = 1000;
    s.guards[1].y = 500;
    s.guards[1].angle = -Math.PI / 2;
    s.cameras[0].angle = Math.PI / 2 + 0.7;
    s.alarm.level = 25;
    s.score = 0;
    s.timeLeft = 96;
    s.message = 'Camera sweeping away — cross now, through the blind spot';
    s.messageT = 99;
    return;
  }

  if (name === 'lootgrab') {
    s.roomIndex = 1;
    s.loadRoom(1);
    s.thief.x = 640;
    s.thief.y = 430;
    s.thief.angle = -Math.PI / 2;
    s.guards[0].x = 420;
    s.guards[0].y = 180;
    s.guards[0].angle = Math.PI / 2;
    s.guards[1].x = 900;
    s.guards[1].y = 470;
    s.guards[1].angle = -Math.PI / 2;
    s.guards[2].x = 640;
    s.guards[2].y = 500;
    s.guards[2].angle = -Math.PI / 2;
    s.guards[2].mode = 'chase';
    s.cameras[0].angle = Math.PI / 2 + 0.5;
    s.cameras[1].angle = Math.PI / 2 - 0.5;
    s.alarm.level = 52;
    s.score = 4000;
    s.timeLeft = 74;
    s.flyingCoins.push({ x0: 640, y0: 430, x: 820, y: 470, t: 0.22, dur: 0.45 });
    s.message = 'Vault gold grabbed — a guard is closing in!';
    s.messageT = 99;
    return;
  }

  if (name === 'getaway') {
    s.roomIndex = 2;
    s.loadRoom(2);
    s.lootGot = true;
    s.thief.x = 1120;
    s.thief.y = 580;
    s.thief.angle = 0;
    s.guards[0].x = 700;
    s.guards[0].y = 300;
    s.guards[0].angle = 0;
    s.guards[1].x = 500;
    s.guards[1].y = 500;
    s.guards[1].angle = Math.PI;
    s.guards[2].x = 900;
    s.guards[2].y = 220;
    s.guards[2].angle = Math.PI / 2;
    s.cameras[0].angle = Math.PI / 2 + 0.4;
    s.cameras[1].angle = Math.PI / 2 - 0.4;
    s.alarm.level = 28;
    s.score = 13000;
    s.timeLeft = 41;
    s.message = 'Diamond secured — alarm draining, slip out the EXIT!';
    s.messageT = 99;
    return;
  }

  // Unknown shot name: plain room 1 play state.
  s.roomIndex = 0;
  s.loadRoom(0);
}
