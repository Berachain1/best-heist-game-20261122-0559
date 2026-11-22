// The Midnight Vault — rendering: floor, rooms, cones, HUD, overlays.
// One job: draw the whole game so cover, danger and loot read at a glance.

import { PALETTE, ROOM_H, TUNE, VIEW } from './config.js';
import { coneFan } from './vision.js';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawFloor(ctx, room) {
  const p = room.palette || {};
  const a = p.floorA || PALETTE.floorA;
  const b = p.floorB || PALETTE.floorB;
  ctx.fillStyle = a;
  ctx.fillRect(0, 0, VIEW.w, ROOM_H);
  const tile = 64;
  ctx.fillStyle = b;
  for (let y = 0; y < ROOM_H; y += tile) {
    for (let x = 0; x < VIEW.w; x += tile) {
      if (((x + y) / tile) % 2 === 0) ctx.fillRect(x, y, tile, tile);
    }
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x <= VIEW.w; x += tile) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, ROOM_H); ctx.stroke();
  }
  for (let y = 0; y <= ROOM_H; y += tile) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VIEW.w, y); ctx.stroke();
  }
  for (const rug of room.rugs) {
    ctx.fillStyle = PALETTE.carpet;
    ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
    ctx.strokeStyle = PALETTE.trimGold;
    ctx.lineWidth = 2;
    ctx.strokeRect(rug.x + 4, rug.y + 4, rug.w - 8, rug.h - 8);
  }
  for (const v of room.vents) {
    ctx.fillStyle = 'rgba(120, 140, 180, 0.35)';
    ctx.fillRect(v.x, v.y, v.w, v.h);
    ctx.fillStyle = 'rgba(220, 230, 255, 0.6)';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('VENT — QUIET ROUTE', v.x + v.w / 2, v.y + v.h / 2 + 4);
  }
}

function drawSolids(ctx, room) {
  for (const s of room.solids) {
    if (s.kind === 'wall') {
      ctx.fillStyle = PALETTE.wall;
      ctx.fillRect(s.x, s.y, s.w, s.h);
      ctx.fillStyle = PALETTE.wallTop;
      if (s.h < s.w) ctx.fillRect(s.x, s.y + s.h - 6, s.w, 6);
      else ctx.fillRect(s.x + s.w - 6, s.y, 6, s.h);
      continue;
    }
    ctx.fillStyle = PALETTE.cover;
    roundRect(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.fill();
    ctx.fillStyle = PALETTE.coverTop;
    roundRect(ctx, s.x + 4, s.y + 4, s.w - 8, Math.min(18, s.h - 8), 6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.trimGold;
    ctx.lineWidth = 1.5;
    roundRect(ctx, s.x, s.y, s.w, s.h, 8);
    ctx.stroke();
    if (s.kind === 'case') {
      ctx.fillStyle = 'rgba(255, 220, 120, 0.25)';
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + s.h / 2, 12, 0, Math.PI * 2);
      ctx.fill();
    }
    if (s.kind === 'vault') {
      ctx.fillStyle = '#8a6d1f';
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + s.h / 2, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffd94a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x + s.w / 2, s.y + s.h / 2, 22, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function drawLoot(ctx, room, state) {
  const loot = room.loot;
  const p = room.lootPos;
  const pulse = 0.6 + 0.4 * Math.sin(state.t * 3);
  ctx.save();
  ctx.fillStyle = `rgba(255, 217, 74, ${0.22 + 0.16 * pulse})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, 46 + 6 * pulse, 0, Math.PI * 2);
  ctx.fill();
  if (state.lootGot) {
    ctx.fillStyle = 'rgba(120, 120, 120, 0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#cfd6e4';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TAKEN', p.x, p.y - 30);
    ctx.restore();
    return;
  }
  if (loot.kind === 'painting') {
    ctx.fillStyle = '#3b2f6b';
    ctx.fillRect(p.x - 26, p.y - 18, 52, 36);
    ctx.strokeStyle = PALETTE.lootGold;
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x - 26, p.y - 18, 52, 36);
    ctx.fillStyle = '#ffd94a';
    ctx.beginPath();
    ctx.arc(p.x, p.y - 4, 7, 0, Math.PI * 2);
    ctx.fill();
  } else if (loot.kind === 'vault') {
    ctx.fillStyle = '#8a6d1f';
    ctx.fillRect(p.x - 22, p.y - 16, 44, 32);
    ctx.strokeStyle = PALETTE.lootGold;
    ctx.lineWidth = 3;
    ctx.strokeRect(p.x - 22, p.y - 16, 44, 32);
    ctx.fillStyle = '#ffd94a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('$', p.x, p.y + 5);
  } else {
    ctx.fillStyle = '#bfe9ff';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y - 20);
    ctx.lineTo(p.x + 16, p.y);
    ctx.lineTo(p.x, p.y + 20);
    ctx.lineTo(p.x - 16, p.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.lootGold;
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★ LOOT: ' + loot.label.toUpperCase(), p.x, p.y - 32);
  ctx.restore();
}

function drawExit(ctx, room, state) {
  const e = room.exit;
  const open = state.lootGot;
  const glow = open ? 0.5 + 0.3 * Math.sin(state.t * 4) : 0.15;
  ctx.save();
  ctx.fillStyle = open ? `rgba(52, 211, 153, ${glow})` : 'rgba(120, 120, 140, 0.2)';
  ctx.fillRect(e.x - 10, e.y - 10, e.w + 20, e.h + 20);
  ctx.fillStyle = open ? '#065f46' : '#3f3f56';
  roundRect(ctx, e.x, e.y, e.w, e.h, 6);
  ctx.fill();
  ctx.strokeStyle = open ? PALETTE.exit : '#6b7280';
  ctx.lineWidth = 3;
  roundRect(ctx, e.x, e.y, e.w, e.h, 6);
  ctx.stroke();
  ctx.fillStyle = open ? '#a7f3d0' : '#9ca3af';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT ✓' : 'EXIT 🔒', e.x + e.w / 2, e.y + e.h / 2 + 5);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = open ? PALETTE.exit : '#9ca3af';
  ctx.fillText(open ? 'GETAWAY — GO!' : 'GRAB THE LOOT FIRST', e.x + e.w / 2, e.y - 16);
  ctx.restore();
}

function drawCameras(ctx, state) {
  for (const c of state.cameras) {
    const disabled = c.disabledT > 0;
    if (!disabled) {
      const fan = coneFan(c.x, c.y, c.angle, c.range, TUNE.cameraHalf);
      ctx.fillStyle = PALETTE.camArc;
      ctx.beginPath();
      ctx.moveTo(fan[0][0], fan[0][1]);
      for (const [x, y] of fan.slice(1)) ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = PALETTE.camEdge;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.fillStyle = disabled ? '#4b5563' : '#1f2937';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = disabled ? '#6b7280' : '#fbbf24';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = disabled ? '#9ca3af' : '#f87171';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8eaf2';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(disabled ? 'CAM OFF' : 'CAM', c.x, c.y - 16);
  }
}

function drawGuards(ctx, state) {
  for (const g of state.guards) {
    const fan = coneFan(g.x, g.y, g.angle, TUNE.coneRange, TUNE.coneHalf);
    ctx.fillStyle = g.mode === 'chase' ? 'rgba(255, 40, 40, 0.42)' : PALETTE.cone;
    ctx.beginPath();
    ctx.moveTo(fan[0][0], fan[0][1]);
    for (const [x, y] of fan.slice(1)) ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = PALETTE.coneEdge;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = g.mode === 'chase' ? '#ef4444' : PALETTE.guard;
    ctx.beginPath();
    ctx.arc(g.x, g.y, TUNE.guardRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = PALETTE.guardDark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(g.x + Math.cos(g.angle) * 5, g.y + Math.sin(g.angle) * 5, 4, 0, Math.PI * 2);
    ctx.fill();
    if (g.mode !== 'patrol') {
      ctx.fillStyle = g.mode === 'chase' ? '#ff5252' : '#ffb020';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.mode === 'chase' ? '! CHASING' : '? SUSPICIOUS', g.x, g.y - 22);
    }
  }
}

function drawThief(ctx, state) {
  const th = state.thief;
  ctx.save();
  if (th.sneaking) {
    ctx.strokeStyle = 'rgba(125, 211, 252, 0.5)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(th.x, th.y, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(th.x, th.y, TUNE.thiefRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PALETTE.thiefDark;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#0c4a6e';
  ctx.beginPath();
  ctx.arc(th.x + Math.cos(th.angle) * 6, th.y + Math.sin(th.angle) * 6, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#e8eaf2';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('YOU', th.x, th.y - 20);
  ctx.restore();
}

function drawCoinsAndSmoke(ctx, state) {
  for (const c of state.coinSpots) {
    if (c.taken) continue;
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c5e10';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('¢', c.x, c.y + 3.5);
  }
  for (const c of state.landedCoins) {
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const f of state.flyingCoins) {
    const p = f.t / f.dur;
    const x = f.x0 + (f.x - f.x0) * p;
    const y = f.y0 + (f.y - f.y0) * p - Math.sin(p * Math.PI) * 30;
    ctx.fillStyle = PALETTE.lootGold;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const s of state.smokes) {
    ctx.fillStyle = PALETTE.smoke;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SMOKE — HIDDEN', s.x, s.y - s.r - 6);
  }
}

function drawHud(ctx, state) {
  ctx.fillStyle = '#0d1020';
  ctx.fillRect(0, 0, VIEW.w, VIEW.hud);
  ctx.strokeStyle = PALETTE.trimGold;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, VIEW.hud);
  ctx.lineTo(VIEW.w, VIEW.hud);
  ctx.stroke();

  ctx.fillStyle = PALETTE.text;
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🌙 THE MIDNIGHT VAULT', 16, 28);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(`Room ${state.roomIndex + 1}/3 — ${state.room.name}`, 16, 50);

  const alarm = state.alarm;
  const ax = 330;
  const aw = 300;
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('ALARM', ax, 20);
  ctx.fillStyle = '#1e2438';
  roundRect(ctx, ax, 26, aw, 22, 6);
  ctx.fill();
  const frac = alarm.level / 100;
  const col = alarm.lockdown ? '#ff2222' : frac > 0.66 ? PALETTE.danger : frac > 0.33 ? PALETTE.warn : PALETTE.ok;
  if (frac > 0.01) {
    ctx.fillStyle = alarm.lockdown && Math.floor(state.t * 6) % 2 === 0 ? '#ffffff' : col;
    roundRect(ctx, ax, 26, aw * frac, 22, 6);
    ctx.fill();
  }
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 1.5;
  roundRect(ctx, ax, 26, aw, 22, 6);
  ctx.stroke();
  ctx.fillStyle = alarm.lockdown ? '#ff5252' : PALETTE.text;
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(alarm.lockdown ? '🔒 LOCKDOWN!' : alarm.seenNow ? '👁 SPOTTED!' : 'hidden', ax + aw + 10, 42);

  ctx.fillStyle = PALETTE.lootGold;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE $${state.score.toLocaleString('en-US')}`, 700, 30);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '13px sans-serif';
  ctx.fillText(state.lootGot ? `✓ ${state.room.loot.label} secured` : `Loot: ${state.room.loot.label} ($${state.room.loot.value.toLocaleString('en-US')})`, 700, 50);

  ctx.fillStyle = state.timeLeft < 20 ? PALETTE.danger : PALETTE.text;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`⏱ ${Math.ceil(state.timeLeft)}s`, 1264, 30);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '12px sans-serif';
  ctx.fillText(`🪙×${state.coins}  💨×${state.smokeLeft}  ⚡×${state.empLeft}`, 1264, 50);
  ctx.textAlign = 'left';

  if (state.messageT > 0 && state.message) {
    ctx.fillStyle = 'rgba(10, 12, 24, 0.85)';
    const w = ctx.measureText(state.message).width + 28;
    roundRect(ctx, (VIEW.w - w) / 2, VIEW.hud + 8, w, 30, 8);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.message, VIEW.w / 2, VIEW.hud + 28);
    ctx.textAlign = 'left';
  }
}

function drawTitle(ctx, state) {
  ctx.fillStyle = 'rgba(5, 7, 16, 0.82)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.fillStyle = PALETTE.lootGold;
  ctx.font = 'bold 64px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🌙 THE MIDNIGHT VAULT', VIEW.w / 2, 220);
  ctx.fillStyle = PALETTE.text;
  ctx.font = '22px sans-serif';
  ctx.fillText('Three rooms. Three treasures. One quiet thief.', VIEW.w / 2, 268);
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '18px sans-serif';
  ctx.fillText('WASD / arrows — move    Shift — sneak    Click — toss a coin', VIEW.w / 2, 330);
  ctx.fillText('E — smoke puff    Q — EMP the nearest camera', VIEW.w / 2, 360);
  ctx.fillText('Stay out of red cones and camera arcs. Grab the gold loot,', VIEW.w / 2, 400);
  ctx.fillText('then reach the green EXIT before the alarm hits 100.', VIEW.w / 2, 428);
  ctx.fillStyle = PALETTE.exit;
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('— click or press any key to begin the heist —', VIEW.w / 2, 500);
  ctx.textAlign = 'left';
}

function drawEnd(ctx, state) {
  ctx.fillStyle = 'rgba(5, 7, 16, 0.78)';
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
  ctx.textAlign = 'center';
  if (state.phase === 'win') {
    ctx.fillStyle = PALETTE.lootGold;
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('🏆 CLEAN GETAWAY!', VIEW.w / 2, 240);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '24px sans-serif';
    ctx.fillText(`All three treasures secured. Final score: $${state.score.toLocaleString('en-US')}`, VIEW.w / 2, 300);
    ctx.fillText(`Lockdowns survived: ${state.lockdowns}   •   Coins left: ${state.coins}`, VIEW.w / 2, 340);
  } else if (state.phase === 'timeout') {
    ctx.fillStyle = PALETTE.danger;
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText('⏱ OUT OF TIME', VIEW.w / 2, 240);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '24px sans-serif';
    ctx.fillText('The night crew left without you. The room resets — try again.', VIEW.w / 2, 300);
  }
  ctx.fillStyle = PALETTE.textDim;
  ctx.font = '18px sans-serif';
  ctx.fillText('Press R to play again', VIEW.w / 2, 420);
  ctx.textAlign = 'left';
}

export function drawGame(ctx, state) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  ctx.save();
  ctx.translate(0, VIEW.hud);
  drawFloor(ctx, state.room);
  drawLoot(ctx, state.room, state);
  drawExit(ctx, state.room, state);
  drawCoinsAndSmoke(ctx, state);
  drawCameras(ctx, state);
  drawGuards(ctx, state);
  drawThief(ctx, state);
  ctx.restore();
  drawHud(ctx, state);
  if (state.phase === 'title') drawTitle(ctx, state);
  if (state.phase === 'win' || state.phase === 'timeout') drawEnd(ctx, state);
  if (state.phase === 'roomclear') {
    ctx.fillStyle = 'rgba(5, 7, 16, 0.55)';
    ctx.fillRect(0, 0, VIEW.w, VIEW.h);
    ctx.fillStyle = PALETTE.exit;
    ctx.font = 'bold 44px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✓ ${state.room.loot.label} secured!`, VIEW.w / 2, 330);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '22px sans-serif';
    ctx.fillText('Slip out the EXIT to the next floor…', VIEW.w / 2, 380);
    ctx.textAlign = 'left';
  }
}
