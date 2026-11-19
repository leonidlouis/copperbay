# COPPER BAY

**A city worth stealing back.** An original open-world crime game about courier Mara Vale, a stolen ledger, and the people who own a sunlit harbor city.

[![make.fun · gta6-01](https://make.fun/badge/gta6-01.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![rank](https://make.fun/badge/gta6-01/leonidlouis/copperbay/rank.svg)](https://make.fun/bounty/gta6-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)
[![reward](https://make.fun/badge/gta6-01/leonidlouis/copperbay/reward.svg)](https://make.fun/bounty/gta6-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-01)

An entry in the make.fun bounty [gta6-01: Make GTA 6](https://make.fun/bounty/gta6-01).

## Play

Run `node serve.ts` and open **http://localhost:8080** in desktop Chrome. No installation or build step. The game uses local ES modules, WebGL2 geometry, Canvas HUD and WebAudio synthesis; it has no external runtime assets or services. Click New Game or press Enter. Audio starts after your first interaction.

Read Inez's opening conversation with Enter, then press E to take the coral Cavell. The circular map marks your destination in gold. The first job is a drive south to Pier 09; later jobs introduce armed couriers, timed deliveries, a security jammer, a citywide pursuit and a showdown at the docks.

## Features

- A real 3D third-person chase camera with perspective aiming, collision avoidance, golden-hour sky, sun, sea reflections, atmospheric fog and lit architecture. V switches to the original isometric view; both render the same simulation.
- A seeded, explorable city: Port Meridian's cranes and piers, Crown Quarter's commercial blocks, Saffron Strip's neon storefronts, and Verdigris Hills' pool terraces. Roads, crosswalks, signals, sidewalks, rooftop equipment, parks, palms and water.
- On-foot movement, sprinting, mouse aiming, punches, pistols and an unlockable scattergun. Enemy gunfire, armor, health, cash and weapon caches, and Night Owl Supply's equipment shop.
- Steal and drive Cavell XR coupes, Bayliner sedans, Porter vans, Sun Cabs and police interceptors, each with its own acceleration, speed, steering, grip and durability. Lane traffic brakes for signals and other cars. Pedestrians flee danger.
- Five wanted levels, pursuing police cars, armed officers, arrest pressure and roadblocks. Break contact to lose heat. An airborne tracking helicopter joins high-level pursuits. Ghost Customs on the Port Meridian waterfront offers repairs ($250) and a heat-clearing respray ($350).
- Six story jobs with Inez Rook, Sol Navarro, Ada Wren and Mara Vale. Conversations, distinct objectives, payouts, chapter results and a concluding radio broadcast. Explore freely after the story.
- Dense live HUD: chapter objectives, stage progress, next objective and mission timer; police unit status and distances; weapon slots; radio now-playing card; portrait dialogue; circular minimap; condition, nitro, health, armor and respect. Drift chains and near misses earn cash and score popups.
- Ghost Customs upgrade shop: three engine and armor levels, rechargeable nitro, repair and respray. Upgrades affect acceleration, top speed and collision damage and persist with the saved vehicle.
- Full city map with the six story jobs marked DONE / ACTIVE / LOCKED, a destination route, services, police, district names and completion, play time, theft, takedown, escape and distance statistics.
- Procedural lighting, headlights, sirens, skid marks, particles, gun flashes, explosions and camera shake.
- Synthesized coastal electro music and effects, adjustable volume, pause, WASTED/BUSTED recovery, New Game and Continue. The vehicle, paint, upgrades and progress save locally at chapter boundaries, periodically without heat, and with K. Continue resumes the current chapter from its contact; an in-progress objective is retried.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Walk relative to the camera; accelerate/reverse and steer a car |
| Shift | Sprint on foot / boost with installed nitro |
| Space | Handbrake while driving |
| E | Enter, steal or exit a car; talk to a contact; use a shop or service |
| Mouse / left click | Aim / fire; advance a conversation |
| F | Punch |
| 1 / 2 / 3 | Pistol / fists / scattergun (after acquiring it) |
| Enter | Start, advance dialogue, continue chapter results, recover after arrest/death |
| V | Toggle 3D chase / isometric camera |
| Q / R | Orbit the camera on foot in 3D |
| M | Toggle city map |
| G | Open Ghost Customs when driving near its G marker |
| Tab | Replay the active contact’s radio call |
| Escape / P | Pause / return; close a map or shop |
| K | Save when wanted level is clear |
| C on title | Controls and volume |

On foot, visit Night Owl Supply for ammunition ($80), armor ($180), first aid ($100) or a scattergun ($650). The Bay Clinic restores health for $100. Services are marked on the city map. Your safehouse saves progress; Ghost Customs accepts a driven vehicle. Use E or G near the waterfront workshop to open its upgrade menu, then click an item to install it. E or Escape closes the menu. Audio volume is in the title's Controls & Audio menu and the pause menu.

## Photography and hand-in

`shots.json` defines four deterministic 1280 × 800 photographs. The `?shot=1-cover`, `?shot=2`, `?shot=3` and `?shot=4` modes stage world state and use the ordinary city, actor, lighting, HUD and menu renderers. No screenshots are post-processed.

- `1-cover.jpg`: A four-star 3D waterfront pursuit with traffic, pedestrians, a tracking helicopter, police response, mission stages and the full driving HUD.
- `2-on-foot.jpg`: A 3D plaza gunfight with armed couriers, police, pickups, a stealable Cavell and Inez's portrait radio dialogue.
- `3-city-map.jpg`: The full city map, story mission list, service legend, completion and player statistics.
- `4-ghost-customs.jpg`: Port Meridian's upgrade shop, customized Cavell, mission payout and five-chapter progress.

Build the deterministic dossier with:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The hand-in preserves the kit's dossier builder and copies the static game and four JPEG photographs into `out/`. Source modules separate camera projection, WebGL rendering, city and actor geometry, HUD panels, city map, garage upgrades, city generation, driving/traffic, police, combat, story, saves, audio and input. All art and sound are generated by the game's own code. MIT licensed; see [LICENSE](LICENSE).
