// The Midnight Vault — the three rooms: walls, cover, patrols, cameras, loot, exit.
// One job: the map of each floor. Coordinates are room-local: x 0..1280, y 0..656
// (the 64px HUD sits above the room). Solids block movement and sight.

import { LOOT_DEFS, ROOM_NAMES } from './config.js';

function perimeter() {
  return [
    { x: 0, y: 0, w: 1280, h: 26, kind: 'wall' },
    { x: 0, y: 630, w: 1280, h: 26, kind: 'wall' },
    { x: 0, y: 0, w: 24, h: 656, kind: 'wall' },
    { x: 1256, y: 0, w: 24, h: 656, kind: 'wall' },
  ];
}

function roomBase(index, extra) {
  return {
    index,
    name: ROOM_NAMES[index],
    loot: { ...LOOT_DEFS[index] },
    timeLimit: 120,
    solids: [...perimeter(), ...(extra.solids || [])],
    rugs: extra.rugs || [],
    vents: extra.vents || [],
    guards: extra.guards,
    cameras: extra.cameras,
    start: extra.start,
    exit: extra.exit,
    lootPos: extra.lootPos,
    coinSpots: extra.coinSpots || [],
    palette: extra.palette || {},
  };
}

export function buildRoom(index) {
  if (index === 0) {
    return roomBase(0, {
      start: { x: 80, y: 580 },
      exit: { x: 1180, y: 580, w: 64, h: 52 },
      lootPos: { x: 1120, y: 74 },
      guards: [
        { x: 300, y: 270, waypoints: [[300, 270], [950, 270]], pause: 1.2 },
        { x: 1050, y: 330, waypoints: [[1050, 330], [880, 330]], pause: 1.0 },
      ],
      cameras: [
        { x: 640, y: 30, base: Math.PI / 2, sweep: 0.75, speed: 0.55, range: 215 },
      ],
      solids: [
        { x: 240, y: 150, w: 150, h: 70, kind: 'case', label: 'display case' },
        { x: 560, y: 120, w: 170, h: 70, kind: 'case', label: 'display case' },
        { x: 900, y: 170, w: 150, h: 70, kind: 'case', label: 'display case' },
        { x: 330, y: 380, w: 170, h: 70, kind: 'case', label: 'display case' },
        { x: 700, y: 400, w: 170, h: 70, kind: 'case', label: 'display case' },
        { x: 1020, y: 430, w: 130, h: 70, kind: 'case', label: 'display case' },
        { x: 600, y: 330, w: 60, h: 60, kind: 'pillar', label: 'marble pillar' },
      ],
      rugs: [{ x: 430, y: 250, w: 420, h: 150, label: 'gallery carpet' }],
      vents: [{ x: 120, y: 596, w: 900, h: 26, label: 'vent shaft' }],
      coinSpots: [{ x: 200, y: 500 }, { x: 1000, y: 110 }],
      palette: { floorA: '#171c30', floorB: '#1c2338', accent: '#c9a227' },
    });
  }

  if (index === 1) {
    return roomBase(1, {
      start: { x: 80, y: 580 },
      exit: { x: 1180, y: 580, w: 64, h: 52 },
      lootPos: { x: 640, y: 388 },
      guards: [
        { x: 320, y: 180, waypoints: [[320, 180], [960, 180]], pause: 1.0 },
        { x: 960, y: 470, waypoints: [[960, 470], [320, 470]], pause: 1.0 },
        { x: 180, y: 330, waypoints: [[180, 330], [420, 330]], pause: 1.4 },
      ],
      cameras: [
        { x: 300, y: 30, base: Math.PI / 2, sweep: 0.7, speed: 0.7, range: 215 },
        { x: 980, y: 30, base: Math.PI / 2, sweep: 0.7, speed: 0.6, range: 215 },
      ],
      solids: [
        { x: 180, y: 110, w: 120, h: 90, kind: 'crate', label: 'gold crates' },
        { x: 980, y: 110, w: 120, h: 90, kind: 'crate', label: 'gold crates' },
        { x: 180, y: 440, w: 120, h: 90, kind: 'crate', label: 'gold crates' },
        { x: 980, y: 440, w: 120, h: 90, kind: 'crate', label: 'gold crates' },
        { x: 430, y: 90, w: 420, h: 60, kind: 'desk', label: 'counting desks' },
        { x: 430, y: 500, w: 420, h: 60, kind: 'desk', label: 'counting desks' },
        { x: 600, y: 250, w: 80, h: 100, kind: 'vault', label: 'the vault' },
      ],
      rugs: [{ x: 480, y: 220, w: 320, h: 210, label: 'vault floor' }],
      vents: [
        { x: 120, y: 596, w: 900, h: 26, label: 'vent shaft' },
        { x: 120, y: 60, w: 26, h: 420, label: 'vent shaft' },
      ],
      coinSpots: [{ x: 640, y: 90 }, { x: 120, y: 320 }, { x: 1160, y: 320 }],
      palette: { floorA: '#14201c', floorB: '#182722', accent: '#3fae7a' },
    });
  }

  return roomBase(2, {
    start: { x: 80, y: 580 },
    exit: { x: 1180, y: 580, w: 64, h: 52 },
    lootPos: { x: 640, y: 204 },
    guards: [
      { x: 300, y: 300, waypoints: [[300, 300], [980, 300]], pause: 1.0 },
      { x: 980, y: 420, waypoints: [[980, 420], [700, 420]], pause: 1.0 },
      { x: 640, y: 420, waypoints: [[640, 420], [900, 420]], pause: 1.2 },
    ],
    cameras: [
      { x: 200, y: 30, base: Math.PI / 2, sweep: 0.8, speed: 0.65, range: 215 },
      { x: 1080, y: 30, base: Math.PI / 2, sweep: 0.8, speed: 0.75, range: 215 },
    ],
    solids: [
      { x: 220, y: 130, w: 170, h: 80, kind: 'sofa', label: 'velvet sofa' },
      { x: 890, y: 130, w: 170, h: 80, kind: 'sofa', label: 'velvet sofa' },
      { x: 220, y: 440, w: 170, h: 80, kind: 'sofa', label: 'velvet sofa' },
      { x: 890, y: 440, w: 170, h: 80, kind: 'sofa', label: 'velvet sofa' },
      { x: 590, y: 100, w: 100, h: 70, kind: 'pedestal', label: 'diamond pedestal' },
      { x: 480, y: 330, w: 320, h: 56, kind: 'table', label: 'grand table' },
    ],
    rugs: [{ x: 400, y: 240, w: 480, h: 200, label: 'penthouse carpet' }],
    vents: [
      { x: 120, y: 596, w: 900, h: 26, label: 'vent shaft' },
      { x: 1130, y: 60, w: 26, h: 420, label: 'vent shaft' },
    ],
    coinSpots: [{ x: 150, y: 300 }, { x: 1130, y: 300 }, { x: 640, y: 560 }],
    palette: { floorA: '#221826', floorB: '#2a1e2e', accent: '#d4a017' },
  });
}

export function roomCount() {
  return 3;
}
