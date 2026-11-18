// Four reproducible moments, staged with the same objects and renderers as play.
import { makeCar } from './vehicles.js';
import { createMissionState } from './missions.js';
export function stageShot(state, name) {
  state.screen = 'play'; state.elapsed = 37.4; state.time = 15.8;
  state.toast.time = 0;
  Object.assign(state.player, { money: 12480, ammo: 86, health: 88, armor: 70, x: 292, y: 1760, angle: -1.32 });
  state.progression = { xp: 1530, races: 3, bestRace: 38.6, turbo: true, chassis: false, banner: 0 };
  state.stats = { ...state.stats, carsStolen: 9, takedowns: 12, missions: 4, distance: 18300 };
  state.mission = createMissionState(4); state.mission.active = true;
  state.camera = { x: 280, y: 1760, zoom: 1.2 };
  state.cars = state.cars.filter(c => Math.hypot(c.x - 320, c.y - 1760) > 1000);
  state.peds = state.peds.filter(c => Math.hypot(c.x - 320, c.y - 1760) > 1000);
  const addCar = (x, y, type, color, angle, speed = 0) => {
    const c = makeCar(x, y, type, color, angle); c.speed = speed; c.driver = true; c.cruise = speed; state.cars.push(c); return c;
  };
  const ped = (x, y, i, extra = {}) => {
    const a = { x, y, hp: 70, angle: -1.3, flee: 4, color: ['#f47d6e', '#4cc7c0', '#ffc86b', '#b7a2d2'][i % 4], seed: i, cooldown: .5, ...extra }; state.peds.push(a); return a;
  };
  const hero = addCar(292, 1760, 'coupe', '#ff7659', -1.32, 410); hero.stolen = true;
  state.player.car = hero;
  addCar(293, 1925, 'patrol', '#f2eedc', -1.55, 360);
  addCar(348, 2040, 'patrol', '#f2eedc', -1.42, 340);
  addCar(348, 1585, 'patrol', '#f2eedc', 1.77, 280);
  addCar(510, 1788, 'patrol', '#f2eedc', Math.PI + .2, 300);
  addCar(292, 2250, 'patrol', '#f2eedc', -1.6, 310);
  addCar(348, 1385, 'taxi', '#f4c25c', Math.PI / 2, 120);
  addCar(690, 1732, 'van', '#73c6b9', Math.PI, 95);
  addCar(270, 1160, 'sedan', '#d6b8db', -Math.PI / 2, 110);
  addCar(970, 1788, 'coupe', '#f6d39c', 0, 145);
  for (let i = 0; i < 24; i++) ped(i % 3 ? 228 : 412, 1120 + i * 48, i, { angle: i % 2 ? -1.5 : 1.5 });
  for (let i = 0; i < 8; i++) ped(-75 + (i % 2) * 90, 1150 + i * 135, i, { flee: 0 });
  ped(412, 1590, 31, { police: true, angle: 2.05, flee: 0 });
  ped(412, 1970, 32, { police: true, angle: -2.1, flee: 0 });
  state.heat = 4; state.unseen = 0;
  state.helicopter = { x: 425, y: 1730, angle: 2.5, seen: true };
  for (let i = 0; i < 40; i++) state.effects.skid(292 + Math.sin(i / 9) * 15, 1780 + i * 9, -Math.PI / 2 + Math.sin(i / 9) * .2);
  state.effects.burst(323, 1910, '#ffe0a0', 40, 140, 12);
  for (let i = 0; i < 9; i++) state.effects.burst(292, 1790 + i * 12, '#e9d2ad', 4, 32, 5);
  state.effects.update(.23);
  if (name === '2' || name === 'onfoot') {
    Object.assign(state.player, { car: null, x: 231, y: 1635, angle: .95, muzzle: .1 });
    Object.assign(hero, { x: 310, y: 1730, angle: -1.15, speed: 0, parked: true });
    state.camera = { x: 270, y: 1660, zoom: 1.65 }; state.time = 15.4; state.heat = 2; state.helicopter = null;
    state.mission = createMissionState(1); Object.assign(state.mission, { active: true, step: 1, briefing: true, dialogue: 1, radio: true });
    ped(310, 1810, 3, { hp: 65, enemy: true, angle: -1.9 });
    ped(389, 1690, 4, { hp: 85, enemy: true, angle: -2.8 });
    ped(285, 1500, 5, { hp: 100, police: true, angle: 1.8 });
    state.bullets.push({ x: 266, y: 1690, angle: .95, life: .5, owner: 'player', speed: 1050 }, { x: 330, y: 1755, angle: -2.1, life: .5, owner: 'enemy', speed: 1050 });
    state.effects.burst(285, 1720, '#ffcf77', 18, 90, 16);
    state.pickups.push({ x: 204, y: 1610, kind: 'ammo', value: 40 }, { x: 390, y: 1790, kind: 'cash', value: 100 });
    state.peds = state.peds.filter(a => Math.hypot(a.x - state.player.x, a.y - state.player.y) > 80);
    state.pointer = { x: 760, y: 512 };
  }
  if (name === '3' || name === 'map') {
    state.mapOpen = true; state.time = 15.5;
    state.player.shotgun = true; state.progression.chassis = true;
  }
  if (name === '4' || name === 'docks') {
    state.cars = state.cars.filter(c => !c.police); state.helicopter = null; state.heat = 0; state.time = 15.9;
    Object.assign(hero, { x: 348, y: 3195, angle: -.24, speed: 0, hp: 115 });
    Object.assign(state.player, { x: hero.x, y: hero.y, money: 16080, shotgun: true });
    state.camera = { x: 365, y: 3210, zoom: 1.16 }; state.garageOpen = true;
    state.mission = createMissionState(5); Object.assign(state.mission, { active: true, step: 0, banner: 7, lastName: 'DEAD AIR', lastPayout: 3600 });
    state.stats.missions = 5; state.progression.xp = 1850;
    ped(445, 3255, 1, { hp: 100, flee: 0 }); ped(550, 3260, 2, { enemy: true, angle: -2.4 });
    ped(700, 3190, 3, { enemy: true, angle: 2.9 }); ped(780, 3330, 4, { enemy: true, angle: -2.8 });
    ped(225, 3090, 5, { flee: 0 }); ped(240, 3370, 6, { flee: 0 });
    addCar(490, 3200, 'van', '#6ba8a4', .1); addCar(320, 3465, 'taxi', '#f4c25c', -1.57);
    state.effects.burst(760, 3320, '#ffd28d', 16, 80, 12);
  }
  return state;
}
