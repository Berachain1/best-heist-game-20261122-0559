# 🌙 The Midnight Vault

[![make.fun](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/Berachain1/best-heist-game-20261122-0559/rank.svg)](https://make.fun/c/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/Berachain1/best-heist-game-20261122-0559/reward.svg)](https://make.fun/c/best-heist-game-20261122-0559)

A top-down heist game built for the [make.fun bounty "Make the best heist game"](https://make.fun/c/best-heist-game-20261122-0559).

## The game

You are the thief. Three floors, three treasures: the **Starlit Portrait** in the
Gallery, the **Vault Gold** on the Vault Floor, and the **Midnight Diamond** in the
Penthouse Safe. Every room is a puzzle of moving sight:

- **Guards** patrol with red vision cones — step into one and the alarm climbs.
- **Cameras** sweep fixed arcs with visible blind-spot timing — cross when they look away.
- **Loot** glows gold. Grab it, and the green **EXIT** unlocks.
- The **alarm meter** fills on sightings and drains while you stay hidden. At 100 it
  is lockdown: every guard converges on you.
- **Tools, each at a cost:** toss a coin (click) to pull guards away, a smoke puff
  (`E`, one per room) that no eye can see through, and an EMP (`Q`, one per run)
  that blinds the nearest camera for 5 seconds.
- Several routes per room: open floor (fast, exposed), cover behind display cases,
  or the marked vent shaft (slow, quiet). `Shift` sneaks — slower, harder to spot.

Score is loot value minus alarm penalties, against a 120-second clock per room.

## Play

```bash
node serve.ts
# open http://localhost:8080
```

WASD / arrows to move, Shift to sneak, click to toss a coin, `E` smoke, `Q` EMP,
`R` restart after a win or a timeout. Static files under `game/`, no build step,
no network — all art is drawn in code and all sound is synthesized WebAudio.

## Layout

- `game/src/config.js` — tuning, palette, loot values
- `game/src/rooms.js` — the three room maps
- `game/src/guards.js` — patrol, suspicion, investigation, chase
- `game/src/cameras.js` — sweeping arcs, blind spots, EMP
- `game/src/vision.js` — cones, arcs, line of sight
- `game/src/thief.js` — movement, sneaking, tools
- `game/src/alarm.js` — alarm meter and lockdown
- `game/src/render.js` — drawing the game and HUD
- `game/src/audio.js` — synthesized sound effects
- `game/src/input.js` — keyboard and mouse
- `game/src/shots.js` — deterministic screenshot states
- `game/src/main.js` — the game loop
- `main.ts` — the hand-in program (copies `game/` + `screenshots/`, writes the dossier)
