// Ember Thief: the hand-in program (Node 22, standard library only).
// It gathers the game and its screenshots from beside this file, drops them
// into /output (or MAKEFUN_OUTPUT_DIR outside the grader), and asks the
// vendored make.fun library to write the dossier the judge reads. Run it
// with:  MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTree(from, to) {
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
}

function failIfMissing(dir, label) {
  if (!existsSync(dir)) throw new Error(`missing ${label}: ${dir}`);
}

function countShots(dir) {
  return readdirSync(dir).filter((name) => !name.startsWith('.')).length;
}

function main() {
  const gameDir = join(rootDir, 'game');
  const shotsDir = join(rootDir, 'screenshots');
  failIfMissing(gameDir, 'game/');
  failIfMissing(shotsDir, 'screenshots/');
  if (countShots(shotsDir) < 3) throw new Error('need at least 3 screenshots');

  mkdirSync(outDir, { recursive: true });
  copyTree(gameDir, join(outDir, 'game'));
  copyTree(shotsDir, join(outDir, 'screenshots'));

  // The scorer's own caps, from the kit's gate: dossier text and the file
  // counts and sizes an entry must stay inside.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
}

main();
