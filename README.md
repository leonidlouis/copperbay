# COPPER BAY

**A city worth stealing back.** An original open-world crime game about courier Mara Vale, a stolen ledger, and the people who own a sunlit harbor city.

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/leonidlouis/copperbay/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/leonidlouis/copperbay/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An entry in the make.fun bounty [gta6-01: Make GTA 6](https://make.fun/bounty/gta6-01).

## Play

Run `node serve.ts` and open **http://localhost:8080** in desktop Chrome. No installation or build step. The game uses local ES modules, WebGL2 geometry, canvas UI and WebAudio synthesis; it has no external runtime assets or services. Click New Game or press Enter. Audio starts after your first interaction.

Read Inez's opening conversation with Enter, then press E to take the coral Cavell. The circular map marks your destination in gold. The first job is a drive south to Pier 09; later jobs introduce a gunfight at Crown Plaza, armed couriers, timed deliveries, a security jammer, a citywide pursuit and a showdown at the docks.

## Features

- A third-person 3D chase camera with depth-tested low-poly geometry, warm directional light, atmospheric fog, a golden-hour sky, ocean reflections and a responding helicopter. V switches to the original isometric view. Both views render the same simulation.
- A seeded, explorable city: Port Meridian's cranes and piers, Crown Quarter's commercial blocks, Saffron Strip's neon storefronts, and Verdigris Hills' pool terraces. Roads, crosswalks, signals, sidewalks, rooftop equipment, parks, palms and water.
- On-foot movement, sprinting, mouse aiming, punches, pistols and an unlockable scattergun. Enemy gunfire, armor, health, cash and weapon caches, and Night Owl Supply's equipment shop.
- Steal and drive Cavell XR coupes, Bayliner sedans, Porter vans, Sun Cabs and police interceptors, each with its own acceleration, speed, steering, grip and durability. Lane traffic brakes for signals and other cars. Pedestrians flee danger.
- Five wanted levels, pursuing police cars, armed officers, arrest pressure and roadblocks. Break contact to lose heat. At Ghost Customs, repair for $250 or respray for $350 to clear the search. A five-item workshop also sells three engine levels, three armor levels and rechargeable nitro. Upgrades persist with your save.
- Six story jobs with Inez Rook, Sol Navarro, Ada Wren and Mara Vale. Conversations, distinct objectives, payouts, chapter results and a concluding radio broadcast. Explore freely after the story.
- A dense mission HUD with chapter, objective, stage progress, countdown and next objective; live police unit statuses and distances; weapon slots; radio now-playing card; health, armor and respect; condition, nitro and speedometer; drift and near-miss scores. The full city map shows the six story jobs as DONE / ACTIVE / LOCKED, a route, services, police and progression statistics. Portrait radio dialogue, circular minimap, cash and wanted stars. Day/night lighting, headlights, sirens, skid marks, particles, gun flashes, explosions and camera shake.
- Synthesized coastal electro music and effects, adjustable volume, pause, WASTED/BUSTED recovery, New Game and Continue. Progress saves locally at chapter boundaries, periodically without heat, and with K. Continue resumes the current chapter from its contact; an in-progress objective is retried.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Walk relative to the camera; accelerate/reverse and steer a car |
| Shift | Sprint on foot; hold for nitro while driving after installing it |
| V | Toggle 3D chase / isometric camera |
| Q / R | Rotate the 3D camera while on foot |
| G | Open the workshop when driving near Ghost Customs |
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

On foot, visit Night Owl Supply for ammunition ($80), armor ($180), first aid ($100) or a scattergun ($650). The Bay Clinic restores health for $100. Services are marked on the city map. Your safehouse saves progress; Ghost Customs accepts a driven vehicle; E opens the workshop near its map marker. Engine levels cost $900 / $1,800 / $2,700, armor costs $700 / $1,400 / $2,100, and nitro costs $1,100. Click a service to buy it; E or Escape closes the workshop. Drift with Space and steering, or pass close to traffic at speed, to build style score. Audio volume is in the title's Controls & Audio menu and the pause menu.

## Photography and hand-in

`shots.json` defines four deterministic 1280 × 800 photographs. The `?shot=1-cover`, `?shot=2`, `?shot=3` and `?shot=4` modes stage world state and use the ordinary city, actor, lighting, HUD and menu renderers. No screenshots are post-processed.

- `1-cover.jpg`: four-star waterfront chase in 3D, responding interceptors and helicopter, traffic and pedestrians, stage progress, radio, weapons and full driving HUD.
- `2-on-foot.jpg`: third-person plaza gunfight, Mara's muzzle flash, armed couriers, patrols, pickups and Inez's portrait dialogue.
- `3-city-map.jpg`: all six story chapters, district map and route, service legend, completion, play time, thefts, takedowns and escapes.
- `4-ghost-customs.jpg`: a customized Cavell in Port Meridian, five upgrade services, cash, installed levels and the Dead Air payout with saved chapter progress.

Build the deterministic dossier with:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The hand-in preserves the kit's dossier builder and copies the static game and four JPEG photographs into `out/`. Source modules separate camera projection, WebGL geometry, world rendering, vehicle/character meshes, HUD panels, city map, garage, city generation, driving/traffic, police, combat, story, saves, audio and input. All art and sound are generated by the game's own code. MIT licensed; see [LICENSE](LICENSE).
