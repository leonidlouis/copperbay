# COPPER BAY

**A city worth stealing back.** An original open-world crime game about courier Mara Vale, a stolen ledger, and the people who own a sunlit harbor city.

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/leonidlouis/copperbay/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/leonidlouis/copperbay/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An entry in the make.fun bounty [gta6-01: Make GTA 6](https://make.fun/bounty/gta6-01).

## Play

Run `node serve.ts` and open **http://localhost:8080** in desktop Chrome. No installation or build step. The game uses local ES modules, canvas geometry and WebAudio synthesis; it has no external runtime assets or services. Click New Game or press Enter. Audio starts after your first interaction.

Read Inez's opening conversation with Enter, then press E to take the coral Cavell. The circular map marks your destination in gold. The first job is a drive south to Pier 09; later jobs introduce armed couriers, timed deliveries, a security jammer, a citywide pursuit and a showdown at the docks.

## Features

- A seeded, explorable city: Port Meridian's cranes and piers, Crown Quarter's commercial blocks, Saffron Strip's neon storefronts, and Verdigris Hills' pool terraces. Roads, crosswalks, signals, sidewalks, rooftop equipment, parks, palms and water.
- On-foot movement, sprinting, mouse aiming, punches, pistols and an unlockable scattergun. Enemy gunfire, armor, health, cash and weapon caches, and Night Owl Supply's equipment shop.
- Steal and drive Cavell XR coupes, Bayliner sedans, Porter vans, Sun Cabs and police interceptors, each with its own acceleration, speed, steering, grip and durability. Lane traffic brakes for signals and other cars. Pedestrians flee danger.
- Five wanted levels, pursuing police cars, armed officers, arrest pressure and roadblocks. Break contact to lose heat. Ghost Customs repairs and resprays a car for $250, clearing the search.
- Six story jobs with Inez Rook, Sol Navarro, Ada Wren and Mara Vale. Conversations, distinct objectives, payouts, chapter results and a concluding radio broadcast. Explore freely after the story.
- Circular minimap, full city map, vehicle speedometer, mission guidance, health, armor, ammunition, cash and wanted stars. Day/night lighting, headlights, sirens, skid marks, particles, gun flashes, explosions and camera shake.
- Synthesized coastal electro music and effects, adjustable volume, pause, WASTED/BUSTED recovery, New Game and Continue. Progress saves locally at chapter boundaries, periodically without heat, and with K. Continue resumes the current chapter from its contact; an in-progress objective is retried.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Walk relative to the screen; accelerate/reverse and steer a car |
| Shift | Sprint on foot |
| Space | Handbrake while driving |
| E | Enter, steal or exit a car; talk to a contact; use a shop or service |
| Mouse / left click | Aim / fire; advance a conversation |
| F | Punch |
| 1 / 2 / 3 | Pistol / fists / scattergun (after acquiring it) |
| Enter | Start, advance dialogue, continue chapter results, recover after arrest/death |
| M | Toggle city map |
| Tab | Replay the active contact’s radio call |
| Escape / P | Pause / return; close a map or shop |
| K | Save when wanted level is clear |
| C on title | Controls and volume |

On foot, visit Night Owl Supply for ammunition ($80), armor ($180), first aid ($100) or a scattergun ($650). The Bay Clinic restores health for $100. Services are marked on the city map. Your safehouse saves progress; Ghost Customs accepts a driven vehicle. Audio volume is in the title's Controls & Audio menu and the pause menu.

## Photography and hand-in

`shots.json` defines four deterministic 1280 × 800 photographs. The `?shot=1-cover`, `?shot=2`, `?shot=3` and `?shot=4` modes stage world state and use the ordinary city, actor, lighting, HUD and menu renderers. No screenshots are post-processed.

- `1-cover.jpg`: Dead Air's three-star pursuit, traffic, pedestrians, minimap, mission and driving controls.
- `2-on-foot.jpg`: Mara armed on a busy junction, a stealable Cavell, armed opposition and Inez's mission dialogue.
- `3-new-game.jpg`: The title and local Continue menu overlooking Port Meridian.
- `4-mission-passed.jpg`: Chapter payout, story progress, vehicle/combat stats and continue/new-game actions.

Build the deterministic dossier with:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The hand-in preserves the kit's dossier builder and copies the static game and four JPEG photographs into `out/`. Source modules separate city generation, driving/traffic, police, combat, story, saves, audio, procedural art, HUD, input and camera/loop. All art and sound are generated by the game's own code. MIT licensed; see [LICENSE](LICENSE).
