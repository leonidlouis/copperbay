// Copper Bay's deterministic hand-in. The browser game has no build step or runtime dependencies.
// Run: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, mkdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = realpathSync(fileURLToPath(new URL('.', import.meta.url)));
const folders = ['game', 'screenshots'];
const requested = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? '/output');

function checkDestination(base: string) {
  for (const folder of folders) {
    const source = join(here, folder), target = join(base, folder);
    if (base === here || base === source || base.startsWith(source + sep) || target === here || here.startsWith(target + sep)) {
      throw new Error('Choose an output directory separate from the game and screenshot sources.');
    }
  }
}

checkDestination(requested);
mkdirSync(requested, { recursive: true });
const out = realpathSync(requested);
checkDestination(out);
for (const folder of folders) {
  const target = join(out, folder);
  rmSync(target, { recursive: true, force: true });
  cpSync(join(here, folder), target, { recursive: true });
}
writeFileSync(join(out, 'dossier.json'), buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
}));
console.log('Copper Bay: game, four photographs, and deterministic dossier ready.');
