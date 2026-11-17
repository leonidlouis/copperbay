// Stage ordinary world entities at fixed points so the browser can photograph reproducible frames.
import { makeCar } from './vehicles.js';
import { createMissionState } from './missions.js';
import { dispatchAirUnit } from './helicopter.js';
import { fireWeapon } from './combat.js';
import { setUpGetaway, updateGetaway } from './getaway.js';

function frame(state, x, y, cameraX, cameraY, zoom, time) {
  state.screen = 'play';
  state.elapsed = 37.4;
  state.time = time;
  state.toast.time = 0;
  Object.assign(state.player, { x, y, money: 9260, ammo: 86, health: 78, armor: 62 });
  state.camera = { x: cameraX, y: cameraY, zoom };
  state.cars = state.cars.filter(car => Math.hypot(car.x - x, car.y - y) > 640);
  state.peds = state.peds.filter(ped => Math.hypot(ped.x - x, ped.y - y) > 415);
}

function traffic(state, x, y, type, color, angle, speed = 0) {
  const car = makeCar(x, y, type, color, angle);
  car.speed = speed;
  car.driver = speed !== 0;
  car.parked = !car.driver;
  state.cars.push(car);
  return car;
}

function pedestrian(state, x, y, i, flee = false) {
  const color = ['#f2c577', '#6fbab8', '#df7f6f', '#e4ccb7', '#baa5d3'][i % 5];
  state.peds.push({ x, y, hp: 65, angle: flee ? Math.atan2(y - state.player.y, x - state.player.x) : i * 1.3, flee: flee ? 4 : 0, color, seed: i, police: false });
}

function hostile(state, x, y, police, i) {
  const angle = Math.atan2(state.player.y - y, state.player.x - x);
  const ped = { x, y, hp: i % 2 ? 73 : 94, enemy: !police, police, angle, flee: 0, color: '#bd6b66', seed: i, cooldown: .6 };
  state.peds.push(ped);
  return ped;
}

function getaway(state) {
  frame(state, 352, 1206, 256, 1208, 1.25, 17.33);
  state.mission = createMissionState(4);
  state.mission.active = true;
  state.heat = 4;
  const hero = traffic(state, 352, 1206, 'coupe', '#ed6941', -1.28, 447);
  hero.stolen = true;
  state.player.car = hero;
  state.player.angle = hero.angle;
  for (const [x, y, angle, speed] of [[350, 1321, -1.68, 338], [278, 1229, -1.41, 320], [272, 1406, -1.67, 315], [287, 1510, -1.49, 311], [279, 1082, 1.27, 285]]) {
    traffic(state, x, y, 'patrol', '#edeadc', angle, speed);
  }
  traffic(state, 346, 1024, 'taxi', '#efbf52', 1.57, 82);
  traffic(state, 283, 929, 'sedan', '#82abbb', -1.57, 84);
  traffic(state, 543, 1250, 'van', '#69a5a1', Math.PI, 105);
  traffic(state, 809, 1309, 'sedan', '#dda9ad', 0, 90);
  traffic(state, 289, 1591, 'coupe', '#88ab9a', 1.56, 90);
  for (let i = 0; i < 23; i++) {
    const x = i % 3 === 0 ? 402 + (i % 4) * 6 : 199 + (i % 4) * 8;
    pedestrian(state, x, 915 + i * 28, i, i % 5 !== 0);
  }

  const air = dispatchAirUnit(state, 119, 1310);
  air.altitude = 191;
  air.angle = -.71;
  air.tracking = true;
  air.beam = { x: 355, y: 1261 };
  for (let i = 0; i < 39; i++) {
    const x = 351 - Math.sin(i / 12) * 22;
    state.effects.skid(x, 1212 + i * 7, -1.52 + .13 * Math.cos(i / 12));
    if (i < 17 && i % 2 === 0) state.effects.burst(x, 1225 + i * 6, '#eee1c2d0', 5, 58, 6);
  }
  state.effects.burst(360, 1285, '#ffd381', 28, 153, 8);
  state.effects.update(.28);
}

function plaza(state) {
  frame(state, 551, 1043, 530, 1022, 1.74, 16.85);
  state.mission = createMissionState(1);
  Object.assign(state.mission, { active: true, step: 1, briefing: true, dialogue: 2, radio: true });
  state.heat = 2;
  const player = state.player;
  player.money = 1850;
  const targets = [[627, 976], [650, 1117], [546, 937]];
  targets.forEach(([x, y], i) => hostile(state, x, y, false, i));
  const officer = hostile(state, 460, 1183, true, 3);
  player.angle = Math.atan2(targets[0][1] - player.y, targets[0][0] - player.x);
  state.walking = true;
  const scene = setUpGetaway(state);
  scene.ally.x = 512; scene.ally.y = 1130;
  updateGetaway(state, 1 / 60);
  state.peds.at(-1).x -= 13;
  state.peds.at(-1).y -= 8;
  traffic(state, 322, 1178, 'patrol', '#ece9d8', -1.29, 35);
  traffic(state, 348, 917, 'taxi', '#e0b157', -1.57, 83);
  traffic(state, 291, 1002, 'sedan', '#79a8ac', 1.57, 57);
  traffic(state, 532, 827, 'van', '#69a5a1', 0, 61);
  for (let i = 0; i < 16; i++) {
    const x = i % 2 ? 215 + (i % 3) * 8 : 468 + i * 14;
    const y = i % 2 ? 845 + i * 31 : 909 + (i % 4) * 69;
    if (Math.hypot(x - player.x, y - player.y) > 37 && !state.city.blocked(x, y)) pedestrian(state, x, y, i, true);
  }
  state.pickups.push({ x: 626, y: 1056, kind: 'ammo', value: 40 });
  fireWeapon(state, player.x, player.y, player.angle);
  const tracer = state.bullets.at(-1);
  tracer.x += Math.cos(tracer.angle) * 61;
  tracer.y += Math.sin(tracer.angle) * 61;
  fireWeapon(state, officer.x, officer.y, officer.angle, 'enemy');
  officer.muzzle = .08;
  const returnFire = state.bullets.at(-1);
  returnFire.x += Math.cos(returnFire.angle) * 34;
  returnFire.y += Math.sin(returnFire.angle) * 34;
  state.effects.update(.09);
  state.heat = 2;
}

function cityMap(state) {
  frame(state, 353, 1030, 435, 1050, 1.24, 16.65);
  state.mission = createMissionState(4);
  state.mission.active = true;
  state.mapOpen = true;
  state.player.shotgun = true;
  Object.assign(state.progression, { rep: 12, records: { paloma: 19.8, customs: 31.6 }, unlockedCars: ['coupe', 'mistral'], tune: true });
  state.player.car = traffic(state, 353, 1030, 'mistral', '#42a6a3', -1.57, 253);
  traffic(state, 750, 812, 'taxi', '#ebbb55', 1.57, 65);
}

function customs(state) {
  frame(state, 432, 3185, 446, 3225, 1.19, 17.35);
  state.mission = createMissionState(5);
  Object.assign(state.mission, { active: true, banner: 7.5, lastName: 'DEAD AIR', lastPayout: 3600 });
  Object.assign(state.progression, { rep: 14, records: { paloma: 19.8, customs: 31.6 }, unlockedCars: ['coupe', 'mistral'], tune: true });
  state.stats.missions = 5;
  state.garageOpen = true;
  state.player.money = 12860;
  const car = traffic(state, 432, 3185, 'mistral', '#42a6a3', -.17);
  car.hp = 54; car.tuned = true;
  state.player.car = car;
  state.player.angle = car.angle;
  traffic(state, 534, 3229, 'van', '#d19a55', Math.PI, 71);
  traffic(state, 291, 3366, 'sedan', '#c88e86', Math.PI / 2, 75);
  traffic(state, 350, 3472, 'taxi', '#e8b654', -Math.PI / 2, 78);
  traffic(state, 349, 3077, 'sedan', '#748d96', -Math.PI / 2, 110);
  traffic(state, 634, 3172, 'coupe', '#f07955', 0, 88);
  for (let i = 0; i < 17; i++) {
    const x = i % 3 ? 401 + (i % 4) * 11 : 230;
    pedestrian(state, x, 2890 + i * 36, i);
  }
}

export function stageShot(state, name) {
  if (name === '2' || name === 'onfoot') plaza(state);
  else if (name === '3' || name === 'map') cityMap(state);
  else if (name === '4' || name === 'customs') customs(state);
  else getaway(state);
}
