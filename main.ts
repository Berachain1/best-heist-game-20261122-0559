// The Midnight Vault — the hand-in program (Node 22, standard library only).
//
// It takes this repository's game/ folder and screenshots/ folder and lays
// them out in the output directory, then writes dossier.json: the summary the
// judge reads, built by the vendored make.fun library. The program runs
// twice in the grader and both runs must write identical bytes, so it does
// nothing time- or order-dependent — plain copies, then one dossier write.
//
// Play it locally with `node serve.ts` (http://localhost:8080), and check
// the hand-in with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the directory this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// The grader sets /output; anywhere else MAKEFUN_OUTPUT_DIR stands in.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The caps mirror the gate's own limits, so a hand-in the scorer would
// refuse is refused here first: at most 4 screenshots, each at most 256 KiB,
// game/ at most 993 files and 48 MiB, and a 160 KiB dossier text budget.
const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
