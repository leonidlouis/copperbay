// Deterministic static hand-in: package the playable city and its four browser photographs.
import { cpSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repository = fileURLToPath(new URL('.', import.meta.url));
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const photographs = readdirSync(join(repository, 'screenshots')).filter(name => !name.startsWith('.')).sort();
if (photographs.length !== 4) throw new Error('Capture all four gameplay photographs before packaging.');
for (const name of photographs) {
  if (!name.endsWith('.jpg') || statSync(join(repository, 'screenshots', name)).size > 262144) {
    throw new Error(`Photograph ${name} must be a JPEG of at most 256 KiB.`);
  }
}
mkdirSync(destination, { recursive: true });
// Clear only generated artifact directories so renamed photographs cannot linger between builds.
for (const directory of ['game', 'screenshots']) {
  rmSync(join(destination, directory), { recursive: true, force: true });
  cpSync(join(repository, directory), join(destination, directory), { recursive: true });
}
writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
}));
console.log('Copper Bay: playable city, four gameplay photographs, deterministic dossier.');
