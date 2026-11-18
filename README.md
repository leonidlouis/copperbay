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

- A seeded, explorable city: Port Meridian's cranes and piers, Crown Quarter's commercial blocks, Saffron Strip's neon storefronts, and Verdigris Hills' pool terraces. Solaris Beach adds golden sand, turquoise shallows, striped parasols, a lifeguard tower, Surf & Sip, a palm-lined boardwalk and a yacht marina. Roads, crosswalks, signals, sidewalks, rooftop equipment, pools and parks connect the city. Late-afternoon light and long shadows give way to a full day/night cycle.
- On-foot movement, sprinting, mouse aiming, punches, pistols and an unlockable scattergun. Enemy gunfire, armor, health, cash and weapon caches, and Night Owl Supply's equipment shop.
- Steal and drive Cavell XR coupes, Bayliner sedans, Porter vans, Sun Cabs and police interceptors, each with its own acceleration, speed, steering, grip and durability. Lane traffic brakes for signals and other cars. Pedestrians flee danger.
- Five wanted levels, pursuing police cars, armed officers, arrest pressure and roadblocks. At four stars, Air One deploys a police helicopter with a moving search cone, rotor, shadow and tracking indicator. Speed and buildings can break aerial contact. Break contact to lose heat. Dockside Ghost Customs repairs and resprays a car for $250, clearing the search, and sells persistent engine and chassis upgrades.
- Solaris Sprint: a repeatable coastal street race with a physical rival, five checkpoint gates, a 120-second deadline, best times, a $900 win payout ($300 for finishing behind the rival), and reputation rewards. Drive to the checkered flag at Solaris Beach and press R.
- Persistent reputation: Runner → Wheelman → Operator → Bay Legend. Story jobs award 320 REP; race wins award 250 REP. Unlock a Stage II engine at 300 REP (+20% acceleration and top speed), a reinforced body at 900 REP (+80 durability), and a complimentary scattergun at 1,800 REP. Driving and combat levels reflect distance and takedowns on the atlas.
- Six story jobs with Inez Rook, Sol Navarro, Ada Wren and Mara Vale. Conversations, distinct objectives, payout banners over the live game, chapter progression and a concluding radio broadcast. Explore freely after the story.
- Circular minimap, a city atlas showing named districts, six story contacts, supplies, garages, the street-race route and a progression/arsenal panel, vehicle speedometer, mission guidance, health, armor, ammunition, cash and wanted stars. Day/night lighting, headlights, sirens, skid marks, particles, gun flashes, explosions and camera shake.
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
| Enter | Start, advance dialogue, recover after arrest/death |
| M | Toggle city atlas and progression |
| R | Start Solaris Sprint near its flag while driving; abandon the active race |
| Tab | Replay the active contact’s radio call |
| Escape / P | Pause / return; close a map, shop or garage |
| K | Save when wanted level is clear |
| C on title | Controls and volume |

On foot, visit Night Owl Supply for ammunition ($80), armor ($180), first aid ($100) or a scattergun ($650). The Bay Clinic restores health for $100. Services are marked on the city map. Your safehouse saves progress; Ghost Customs accepts a driven vehicle. At Ghost Customs on the docks, press E while driving to open the service menu: repair/respray ($250), Stage II engine ($800, 300 REP), reinforced body ($600, 900 REP). Purchased upgrades apply to subsequent stolen vehicles and survive Continue. Escape or E closes the garage. Audio volume is in the title's Controls & Audio menu and the pause menu.

## Photography and hand-in

`shots.json` defines four deterministic 1280 × 800 photographs. The `?shot=1-cover`, `?shot=2`, `?shot=3` and `?shot=4` modes stage world state and use the ordinary city, actor, lighting, HUD, city atlas and service renderers. Staging selects the time and positions ordinary simulation objects; the playable day/night cycle remains active. No screenshots are post-processed.

- `1-cover.jpg`: a four-star high-speed chase on sunlit Ocean Drive, five police cars, Air One, fleeing pedestrians, traffic, tire smoke, skid marks, mission guidance and full driving HUD.
- `2-boardwalk-gunfight.jpg`: Mara firing on the boardwalk, armed opposition, a nearby Cavell, police response, Inez's radio dialogue, health/armor/ammo and the combat controls.
- `3-city-atlas.jpg`: the map over the live world, all districts, story contacts, services, street-race route, chapter, reputation, driving/combat levels, arsenal and garage unlocks.
- `4-dockside-customs.jpg`: a new docks objective, the previous chapter's $3,600 payout, a busy freight apron with cranes and traffic, and the usable Ghost Customs upgrade menu.

Build the deterministic dossier with:

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

The hand-in preserves the kit's dossier builder and copies the static game and four JPEG photographs into `out/`. Source modules separate city generation, seaside scenery, driving/traffic, police, helicopter pursuit, combat, story, street races, reputation, garage services, city atlas, saves, audio, procedural art, HUD, input and camera/loop. All art and sound are generated by the game's own code. MIT licensed; see [LICENSE](LICENSE).
