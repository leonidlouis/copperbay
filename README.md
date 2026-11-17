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

- Five districts to explore on foot and by car. Paloma Beach has a walkable shore, coastal boulevard, boardwalk and plaza. Across town are Port Meridian’s piers and cranes, Crown Quarter’s commercial blocks, Saffron Strip’s clubs and Verdigris Hills’ pool terraces.
- Steal and drive coupes, sedans, vans, Sun Cabs and police interceptors with distinct handling. Traffic stops for lights and other road users. Pedestrians scatter when a chase or a shootout comes close.
- Six story jobs with Inez Rook, Sol Navarro and Ada Wren. Mara steals a ledger, fights Voss’s couriers, races a timed delivery and tries to get the evidence onto Free Bay Radio. Explore freely after the story.
- Five wanted levels with patrol cars, armed officers and arrest pressure. At four stars, roadblocks go up and CBPD Air One sweeps the streets. Break contact to lose heat or pay Ghost Customs to clear the search.
- Two checkpoint time trials, Paloma Sprint and Port Loop. Beat the clock for cash and a saved personal best. Story jobs and first trial wins earn reputation and unlock the Mistral RS, Caldera GT and a persistent street tune at Ghost Customs.
- Pistol, fists and an unlockable scattergun. Stock up on ammunition, armor and health at Night Owl Supply or pick up caches around the city.
- Circular minimap, full city map with job and service markers, and a profile showing chapter progress, weapons, vehicles and trial times. The city runs through daylight and night with moving surf, streetlights, sirens, skid marks, particles and camera shake.
- Synthesized music and effects, adjustable volume, pause, arrest and death recovery, New Game and Continue. The game saves locally at chapter boundaries, periodically without heat, and via K. Continue restores your saved position, cash, equipment, reputation, garage and records. In-progress objectives and trials restart.

## Controls

| Input | Action |
| --- | --- |
| WASD / arrow keys | Walk relative to the screen; accelerate/reverse and steer a car |
| Shift | Sprint on foot |
| Space | Handbrake while driving |
| E | Enter, steal or exit a car, talk, use a shop or garage, or start a marked time trial in a car with no heat |
| Mouse / left click | Aim / fire; advance a conversation |
| F | Punch |
| 1 / 2 / 3 | Pistol / fists / scattergun (after acquiring it) |
| Enter | Start, advance dialogue, return from the ending, or recover after arrest/death |
| M | Pause with the city map and player profile |
| Tab | Replay the active contact’s radio call |
| Escape / P | Pause or return, and close the map, shop or garage |
| K | Save when wanted level is clear |
| C on title | Controls and volume |

On foot, visit Night Owl Supply for ammunition ($80), armor ($180), first aid ($100) or a scattergun ($650). The Bay Clinic restores health for $100. Services are marked on the city map. Your safehouse saves progress. At Ghost Customs in Port Meridian, press E and click an option to repair and respray your current car ($250), buy the street tune ($700 at 2 reputation), or collect a vehicle. The Mistral RS and Caldera GT become available at 5 and 9 reputation. Audio volume is in Controls & Audio on the title screen and in the pause menu.

## Photography and hand-in

`shots.json` defines four deterministic 1280 × 800 JPEG captures. Each `?shot=` mode stages the playable world and uses the game’s own renderers.

- `1-cover.jpg` · Dead Air’s four-star pursuit on Paloma Boulevard, with Air One, patrols, traffic and fleeing pedestrians.
- `2-on-foot.jpg` · Mara under fire in Paloma Plaza, an Inez radio call, and Sol opening a getaway car.
- `3-city-map.jpg` · The city map alongside Mara’s reputation, loadout, garage and timed records.
- `4-ghost-customs.jpg` · The Dead Air payout at Port Meridian, with Ghost Customs open and the Pier 09 objective on screen.

Build the deterministic dossier with:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The hand-in preserves the kit's dossier builder and copies the static game and four JPEG photographs into `out/`. Source modules separate city generation, driving and traffic, police and air pursuit, combat, story, activity timing, reputation, garage services, map and HUD, saves, audio, and procedural art. All art and sound are generated by the game's own code. MIT licensed; see [LICENSE](LICENSE).
