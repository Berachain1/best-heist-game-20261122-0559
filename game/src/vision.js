// The Midnight Vault — sight: cones, arcs and line of sight.
// One job: decide whether an eye can see a point, and what blocks it.

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

export function segmentHitsRect(x1, y1, x2, y2, r) {
  if (pointInRect(x1, y1, r) || pointInRect(x2, y2, r)) return true;
  const corners = [
    [r.x, r.y, r.x + r.w, r.y],
    [r.x + r.w, r.y, r.x + r.w, r.y + r.h],
    [r.x + r.w, r.y + r.h, r.x, r.y + r.h],
    [r.x, r.y + r.h, r.x, r.y],
  ];
  for (const [cx, cy, dx, dy] of corners) {
    if (segmentsCross(x1, y1, x2, y2, cx, cy, dx, dy)) return true;
  }
  return false;
}

function segmentHitsCircle(x1, y1, x2, y2, cx, cy, radius) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(cx - x1, cy - y1) <= radius;
  let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const px = x1 + t * dx;
  const py = y1 + t * dy;
  return Math.hypot(cx - px, cy - py) <= radius;
}

// True when nothing solid and no smoke cloud sits between the two points.
export function lineOfSight(x1, y1, x2, y2, solids, smokes) {
  for (const s of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, s)) return false;
  }
  for (const cloud of smokes || []) {
    if (segmentHitsCircle(x1, y1, x2, y2, cloud.x, cloud.y, cloud.r)) return false;
  }
  return true;
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Can an eye at (ex, ey) facing `facing` see target (tx, ty)?
// Returns { seen, dist, closeness } — closeness 1 at point-blank, 0 at max range.
export function eyeSees(ex, ey, facing, range, halfAngle, tx, ty, solids, smokes) {
  const dx = tx - ex;
  const dy = ty - ey;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return { seen: false, dist, closeness: 0 };
  if (dist > 4 && Math.abs(angleDiff(Math.atan2(dy, dx), facing)) > halfAngle) {
    return { seen: false, dist, closeness: 0 };
  }
  if (!lineOfSight(ex, ey, tx, ty, solids, smokes)) return { seen: false, dist, closeness: 0 };
  return { seen: true, dist, closeness: 1 - dist / range };
}

// Points of a filled cone fan, for drawing.
export function coneFan(x, y, facing, range, halfAngle, steps = 18) {
  const pts = [[x, y]];
  for (let i = 0; i <= steps; i++) {
    const a = facing - halfAngle + (2 * halfAngle * i) / steps;
    pts.push([x + Math.cos(a) * range, y + Math.sin(a) * range]);
  }
  return pts;
}

export function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

export function turnToward(current, target, maxStep) {
  const d = angleDiff(target, current);
  if (Math.abs(d) <= maxStep) return target;
  return current + Math.sign(d) * maxStep;
}
