// Deterministic photography locations. These stage ordinary simulation objects;
// the world, actors, light, particles, menus and HUD use the normal renderer.
import { makeCar } from './vehicles.js';
import { createMissionState } from './missions.js';
export function stageShot(state, name) {
  state.screen = 'play'; state.elapsed = 37.4; state.time = 18.75;
  state.toast.time = 0; state.player.money = 12480; state.player.ammo = 86; state.player.health = 88; state.player.armor = 70;
  state.mission = createMissionState(4); state.mission.active = true;
  state.player.x = 1732; state.player.y = 1720; state.camera = { x: 1732, y: 1720, zoom: 1.07 };
  // Clear a small photo area, then place lane-respecting traffic at useful positions.
  state.cars = state.cars.filter(c => Math.hypot(c.x - 1760, c.y - 1760) > 650);
  const add = (x, y, type, color, angle, speed = 0) => { const c = makeCar(x, y, type, color, angle); c.speed = speed; c.driver = true; state.cars.push(c); return c; };
  const hero = add(1732, 1720, 'coupe', '#ff8e70', -1.32, 345); state.player.car = hero; state.player.angle = hero.angle;
  add(1732, 1863, 'patrol', '#e5e7db', -1.65, 300);
  add(1570, 1732, 'patrol', '#e5e7db', .1, 280);
  add(1970, 1788, 'patrol', '#e5e7db', Math.PI, 300);
  add(1732, 2125, 'patrol', '#e5e7db', -Math.PI / 2, 285);
  add(1515, 1788, 'taxi', '#edc063', 0, 95);
  add(1732, 1445, 'van', '#70aba9', Math.PI / 2, 70);
  add(2125, 1732, 'sedan', '#d4bbd1', Math.PI, 75);
  add(1265, 1732, 'coupe', '#7ebca7', Math.PI, 120);
  add(1788, 1360, 'sedan', '#d8e0cd', -Math.PI / 2, 110);
  state.heat = 3; state.unseen = 0;
  for (let i = 0; i < 24; i++) {
    const side = i % 2 ? 1 : -1;
    state.peds.push({ x: 1760 + side * 99, y: 1370 + i * 33, hp: 70, angle: i * 2, flee: i % 3 ? 0 : 3, color: ['#eab477', '#65c6c3', '#e691a2', '#c0b4d1'][i % 4], seed: i, police: false });
  }
  for (let i = 0; i < 34; i++) state.effects.skid(1732 + Math.sin(i / 10) * 6, 1730 + i * 10, -Math.PI / 2);
  state.effects.burst(1751, 1850, '#ffc78a', 34, 155, 10);
  for (let i = 0; i < 8; i++) state.effects.burst(1730 + Math.sin(i) * 5, 1750 + i * 10, '#abb7b2', 3, 24, 6);
  state.effects.update(.24);
  state.stats = { ...state.stats, carsStolen: 9, takedowns: 12, missions: 4, distance: 18300 };
  if (name === '2' || name === 'onfoot') {
    state.player.car = null; state.player.x = 1760; state.player.y = 1687; state.player.angle = 1.2; state.player.muzzle = .1;
    hero.x = 1810; hero.y = 1740; hero.angle = -1.2; hero.speed = 0; hero.parked = true;
    state.camera = { x: 1760, y: 1715, zoom: 1.55 }; state.time = 16.3; state.heat = 2;
    state.mission = createMissionState(1); state.mission.active = true; state.mission.step = 1; state.mission.briefing = true; state.mission.dialogue = 1; state.mission.radio = true;
    state.peds.push({ x: 1760, y: 1820, hp: 65, enemy: true, police: false, angle: -2, color: '#d17d7b', seed: 3, cooldown: 0 });
    state.peds.push({ x: 1850, y: 1760, hp: 65, enemy: true, police: false, angle: -.7, color: '#b17484', seed: 4, cooldown: 0 });
    state.peds.push({ x: 1785, y: 1595, hp: 70, police: true, angle: Math.PI / 2, color: '#6a9db0', seed: 5 });
    state.bullets.push({ x: 1790, y: 1754, angle: 1.2, life: .5, owner: 'player' });
    state.effects.burst(1797, 1798, '#ffc383', 18, 90, 16);
    state.pickups.push({ x: 1720, y: 1730, kind: 'ammo', value: 40 }, { x: 1700, y: 1760, kind: 'cash', value: 100 });
  }
  if (name === '3' || name === 'title') {
    state.screen = 'title'; state.time = 17.4; state.camera = { x: 200, y: 3070, zoom: 1.05 };
  }
  if (name === '4' || name === 'complete') {
    state.screen = 'complete'; state.time = 6.7; state.mission.index = 5; state.mission.active = false; state.mission.lastName = 'DEAD AIR'; state.mission.lastPayout = 3600; state.mission.banner = 0;
    state.stats.missions = 5; state.player.money = 16080; state.heat = 0;
  }
  return state;
}
