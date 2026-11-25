// Sunny Side Diner - a cozy diner cooking game, handed in for make.fun.
//
// The game itself lives in game/ as plain static files (game/index.html and
// the ES modules under game/src/), so it plays offline in a desktop browser
// with no build step and no network request. This program's only job is the
// hand-in: copy game/ and screenshots/ from beside this file into the output
// folder and write dossier.json there with buildDossier from the vendored
// make.fun library, so the dossier always matches the files it describes.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Copy the playable game first, then the screenshots the judge will see.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The caps below mirror the gate's own limits, so the dossier is built from
// exactly the files the scorer accepts: at most 4 screenshots of 256 KiB,
// at most 993 files and 48 MiB under game/, no game path over 1000 bytes,
// and the source text capped at 160 KiB.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);

// A one-line receipt for whoever runs this by hand: what was handed in.
function countFiles(dir) {
  return readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).length;
}
console.log(
  `Sunny Side Diner handed in: ${countFiles(join(out, 'game'))} game files, ` +
    `${countFiles(join(out, 'screenshots'))} screenshots, dossier.json written to ${out}`,
);
