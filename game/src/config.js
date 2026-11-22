// The Midnight Vault — tuning, palette and room constants.
// One job: every number the rest of the game reads, in one place.

export const VIEW = { w: 1280, h: 720, hud: 64 };
export const ROOM_H = VIEW.h - VIEW.hud;

export const TUNE = {
  walkSpeed: 168,
  sneakSpeed: 96,
  guardPatrol: 72,
  guardChase: 148,
  guardInvestigate: 110,
  coneRange: 178,
  coneHalf: 0.62,
  cameraRange: 215,
  cameraHalf: 0.52,
  alarmGuardRate: 62,
  alarmCameraRate: 50,
  alarmDrain: 13,
  alarmGrace: 1.2,
  lockdownSeconds: 6,
  lockdownPenalty: 500,
  timeoutPenalty: 250,
  smokeSeconds: 4,
  empSeconds: 5,
  coinLureRadius: 150,
  coinInvestigateSeconds: 3.2,
  thiefRadius: 13,
  guardRadius: 14,
  grabRadius: 34,
  exitRadius: 40,
};

export const PALETTE = {
  ink: '#0b0e1a',
  floorA: '#171c30',
  floorB: '#1c2338',
  floorC: '#232c47',
  wall: '#2e3552',
  wallTop: '#454f78',
  trimGold: '#c9a227',
  trimDim: '#6b5a1e',
  cover: '#31406b',
  coverTop: '#41548c',
  cloth: '#5a2e3d',
  carpet: '#3a2430',
  lootGold: '#ffd94a',
  lootGlow: 'rgba(255, 217, 74, 0.35)',
  cone: 'rgba(255, 64, 64, 0.28)',
  coneEdge: 'rgba(255, 90, 90, 0.75)',
  camArc: 'rgba(255, 170, 40, 0.30)',
  camEdge: 'rgba(255, 190, 60, 0.8)',
  safe: 'rgba(80, 220, 130, 0.25)',
  danger: '#ff5252',
  warn: '#ffb020',
  ok: '#4ade80',
  text: '#e8eaf2',
  textDim: '#9aa3c0',
  thief: '#7dd3fc',
  thiefDark: '#0369a1',
  guard: '#f87171',
  guardDark: '#7f1d1d',
  exit: '#34d399',
  smoke: 'rgba(200, 205, 220, 0.55)',
};

export const ROOM_NAMES = ['The Gallery', 'The Vault Floor', 'The Penthouse Safe'];

export const LOOT_DEFS = [
  { kind: 'painting', label: 'Starlit Portrait', value: 4000, blurb: 'a stolen masterpiece' },
  { kind: 'vault', label: 'Vault Gold', value: 9000, blurb: 'a case of gold bars' },
  { kind: 'diamond', label: 'The Midnight Diamond', value: 15000, blurb: 'the crown jewel' },
];

export const TOOL_START = { coins: 3, smokePerRoom: 1, empPerRun: 1 };
