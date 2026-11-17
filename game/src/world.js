import { clamp, distance } from './math.js';
import { createCity, PLACES } from './city.js';
import { spawnTraffic, makeCar, moveCar, interactWithCar, updateTraffic, updateCarCollisions } from './vehicles.js';
import { createEffects } from './effects.js';
import { spawnPedestrians, updatePedestrians, updateCombat, fireWeapon, punch } from './combat.js';
import { commitCrime, updatePolice } from './police.js';
import { createMissionState, updateMissions, missionTarget, startBriefing, advanceBriefing } from './missions.js';
import { writeSave } from './save.js';
export function createWorld(audio, save = null) {
  const city = createCity();
  const state = {
    city, audio, screen: 'title', elapsed: 0, time: save?.time || 17.8, heat: 0, lastCrime: -100, unseen: 0, policeTimer: 2, bust: 0, shake: 0, saved: 0,
    player: { x: save?.x || 855, y: save?.y || 790, health: 100, armor: save?.armor ?? 50, ammo: save?.ammo ?? 120, money: save?.money ?? 350, angle: -Math.PI / 2, car: null, cooldown: 0, punch: 0, muzzle: 0, invincible: 0, weapon: 'PISTOL', shotgun: save?.shotgun || false },
    cars: spawnTraffic(), peds: spawnPedestrians(), bullets: [], pickups: [
      { x: 895, y: 1280, kind: 'ammo', value: 50 }, { x: 1855, y: 2240, kind: 'health', value: 50 },
      { x: 895, y: 3200, kind: 'weapon', value: 30 }, { x: 2720, y: 895, kind: 'ammo', value: 60 },
      { x: 3200, y: 1855, kind: 'cash', value: 400 }, { x: 1280, y: 2815, kind: 'cash', value: 300 },
    ], roadblocks: [], effects: createEffects(),
    mission: createMissionState(save?.mission || 0),
    stats: save?.stats || { carsStolen: 0, takedowns: 0, wrecks: 0, missions: 0, policeSpawned: 0, distance: 0 },
    toast: { text: 'Welcome home, Mara · Meet Inez at your garage', time: 6 },
    camera: { x: save?.x || 855, y: save?.y || 790, zoom: 1 }, mapOpen: false, shopOpen: false, settingsOpen: false, autosave: 0,
  };
  state.crime = severity => commitCrime(state, severity);
  state.addCar = (...args) => { const car = makeCar(...args); state.cars.push(car); return car; };
  if (save?.mission >= 6) state.mission.complete = true;
  if (city.blocked(state.player.x, state.player.y, 10)) { state.player.x = 855; state.player.y = 790; }
  return state;
}
export function interact(state) {
  if (state.mission.briefing) { advanceBriefing(state); return; }
  if (state.shopOpen) { state.shopOpen = false; return; }
  const p = state.player, m = state.mission, target = missionTarget(state);
  if (!m.active && !m.complete && target && distance(p, target) < 120) { startBriefing(state); return; }
  if (!p.car) {
    for (const key of ['shop', 'clinic']) if (distance(p, PLACES[key]) < 115) {
      if (key === 'shop') { state.shopOpen = true; return; }
      if (key === 'clinic') { if (p.money >= 100) { p.money -= 100; p.health = 100; state.toast = { text: 'BAY CLINIC · Health restored −$100', time: 3 }; } else state.toast = { text: 'Clinic · $100 required', time: 3 }; return; }
      if (key === 'home') { writeSave(state); state.toast = { text: 'HOME SAFE · Progress saved', time: 3 }; return; }
    }
  }
  if (p.car && distance(p, PLACES.garage) < 130 && p.money >= 250) {
    p.money -= 250; p.car.hp = 150; p.car.color = ['#f58a69', '#62d6c3', '#d7b26b'][Math.floor(state.elapsed) % 3]; state.heat = 0;
    state.toast = { text: 'GHOST CUSTOMS · Repaired, resprayed, heat cleared −$250', time: 4 }; return;
  }
  if (interactWithCar(state)) return;
  if (!p.car && distance(p, PLACES.home) < 115) { writeSave(state); state.toast = { text: 'HOME SAFE · Progress saved', time: 3 }; return; }
  state.toast = { text: 'Find a car, contact, safehouse or shop · M opens the city map', time: 3 };
}
export function buyItem(state, item) {
  const p = state.player, price = item === 'ammo' ? 80 : item === 'armor' ? 180 : item === 'shotgun' ? 650 : 100;
  if (p.money < price) { state.toast = { text: 'Not enough cash. Finish a job or collect a drop.', time: 3 }; return; }
  p.money -= price;
  if (item === 'ammo') p.ammo += 60;
  if (item === 'armor') p.armor = 100;
  if (item === 'health') p.health = 100;
  if (item === 'shotgun') { p.shotgun = true; p.weapon = 'SCATTERGUN'; p.ammo += 30; }
  state.audio.sound('cash'); writeSave(state);
}
export function updateWorld(state, input, aim, dt) {
  if (state.screen !== 'play') return;
  state.elapsed += dt; state.time = (state.time + dt / 100) % 24;
  state.saved = Math.max(0, state.saved - dt); state.shake *= Math.exp(-dt * 12); state.toast.time = Math.max(0, state.toast.time - dt);
  state.effects.update(dt);
  if (state.mapOpen || state.shopOpen || state.mission.briefing) return;
  const p = state.player, oldX = p.x, oldY = p.y;
  if (p.car) {
    const throttle = (input.key('KeyW') || input.key('ArrowUp') ? 1 : 0) - (input.key('KeyS') || input.key('ArrowDown') ? 1 : 0);
    const turn = (input.key('KeyD') || input.key('ArrowRight') ? 1 : 0) - (input.key('KeyA') || input.key('ArrowLeft') ? 1 : 0);
    moveCar(state, p.car, throttle, turn, input.key('Space'), dt);
    p.x = p.car.x; p.y = p.car.y; p.angle = p.car.angle;
  } else {
    // Screen-relative movement is converted back through the oblique projection.
    let sx = (input.key('KeyD') || input.key('ArrowRight') ? 1 : 0) - (input.key('KeyA') || input.key('ArrowLeft') ? 1 : 0);
    let sy = (input.key('KeyS') || input.key('ArrowDown') ? 1 : 0) - (input.key('KeyW') || input.key('ArrowUp') ? 1 : 0);
    let dx = sx / .86 + sy / .48, dy = sy / .48 - sx / .86;
    const len = Math.hypot(dx, dy); if (len > 0) { dx /= len; dy /= len; }
    const speed = input.key('ShiftLeft') || input.key('ShiftRight') ? 195 : 115;
    const nx = p.x + dx * speed * dt, ny = p.y + dy * speed * dt;
    if (!state.city.blocked(nx, p.y, 10)) p.x = nx;
    if (!state.city.blocked(p.x, ny, 10)) p.y = ny;
    if (aim) p.angle = Math.atan2(aim.y - p.y, aim.x - p.x);
    if (input.pointer.down && p.weapon !== 'FISTS') fireWeapon(state, p.x, p.y, p.angle);
    if (input.pointer.down && p.weapon === 'FISTS') punch(state);
    if (input.key('KeyF')) punch(state);
  }
  state.stats.distance += Math.hypot(p.x - oldX, p.y - oldY);
  updateTraffic(state, dt); updateCarCollisions(state, dt); updatePolice(state, dt); updatePedestrians(state, dt); updateCombat(state, dt); updateMissions(state, dt);
  state.autosave += dt;
  if (state.autosave > 40 && state.heat === 0) { writeSave(state); state.autosave = 0; }
}
