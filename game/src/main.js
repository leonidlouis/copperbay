import { PLACES } from './city.js';
import { updateChaseCamera } from './camera.js';
import { buyUpgrade } from './garage.js';
import { createWorld, updateWorld, interact, buyItem } from './world.js';
import { createRenderer } from './render.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { readSave, writeSave, readSettings, saveSettings } from './save.js';
import { advanceBriefing, startBriefing } from './missions.js';
import { stageShot } from './shots.js';
import { lerp, clamp } from './math.js';
const canvas = document.getElementById('game');
const renderer = createRenderer(canvas), input = createInput(canvas), audio = createAudio();
const settings = readSettings(); audio.setVolume(settings.volume);
let save = readSave(), state = createWorld(audio), last = performance.now(), accumulator = 0;
const shot = new URLSearchParams(location.search).get('shot');
function start(continuing = false) {
  state = createWorld(audio, continuing ? readSave() : null); state.screen = 'play';
  audio.unlock(); audio.sound('click');
  if (!continuing) { startBriefing(state); writeSave(state); }
  save = readSave(); document.getElementById('status').textContent = 'Welcome to Copper Bay. Playing as Mara Vale.';
}
function action(id) {
  audio.unlock();
  if (id === 'new') start(false);
  if (id === 'continue') start(true);
  if (id === 'controls') state.settingsOpen = !state.settingsOpen;
  if (id === 'resume') { state.settingsOpen = false; if (state.screen !== 'title') state.screen = 'play'; }
  if (id === 'restart') { start(!!readSave()); state.heat = 0; state.player.health = 100; state.player.money = Math.max(0, state.player.money - 150); state.mission.briefing = false; state.player.x = 855; state.player.y = 790; state.camera.x = 855; state.camera.y = 790; }
  if (id === 'save' && state.heat === 0) { writeSave(state); save = readSave(); }
  if (id === 'louder' || id === 'quieter') { settings.volume = clamp(settings.volume + (id === 'louder' ? .1 : -.1), 0, 1); audio.setVolume(settings.volume); saveSettings(settings); }
  if (['ammo', 'armor', 'health', 'shotgun'].includes(id)) buyItem(state, id);
  if (id === 'closeShop') { state.shopOpen = false; state.garageOpen = false; }
  if (id.startsWith('upgrade:')) buyUpgrade(state, id.slice(8));
  if (id === 'closeMap') state.mapOpen = false;
}
function handleInput() {
  if (input.take('Escape') || input.take('KeyP')) {
    if (state.settingsOpen) state.settingsOpen = false;
    else if (state.garageOpen) state.garageOpen = false;
    else if (state.shopOpen) state.shopOpen = false;
    else if (state.mapOpen) state.mapOpen = false;
    else if (state.screen === 'play') state.screen = 'pause';
    else if (state.screen === 'pause') state.screen = 'play';
  }
  if (input.take('KeyC') && state.screen === 'title') state.settingsOpen = !state.settingsOpen;
  if (input.take('Enter')) {
    if (state.settingsOpen) action('resume');
    else if (state.screen === 'title') action('new');
    else if (state.screen === 'wasted' || state.screen === 'busted') action('restart');
    else if (state.screen === 'complete' || state.screen === 'ending' || state.screen === 'pause') action('resume');
    else if (state.mission.briefing) advanceBriefing(state);
  }
  if (state.screen === 'play') {
    if (input.take('KeyE')) interact(state);
    if (input.take('KeyV')) { state.viewMode = state.viewMode === '3d' ? 'iso' : '3d'; state.toast = { text: state.viewMode === '3d' ? 'CHASE CAMERA' : 'ISOMETRIC CAMERA', time: 2 }; }
    if (input.take('KeyG') && state.player.car && Math.hypot(state.player.x - PLACES.garage.x,state.player.y - PLACES.garage.y)<200) state.garageOpen = !state.garageOpen;
    if (input.take('Tab') && state.mission.active) { state.mission.briefing = true; state.mission.radio = true; state.mission.dialogue = 0; }
    if (input.take('KeyM')) state.mapOpen = !state.mapOpen;
    if (input.take('KeyK')) {
      if (state.heat === 0) { writeSave(state); save = readSave(); }
      else state.toast = { text: 'Lose the heat before saving', time: 3 };
    }
    if (input.take('Digit1')) state.player.weapon = 'PISTOL';
    if (input.take('Digit2')) state.player.weapon = 'FISTS';
    if (input.take('Digit3')) { if (state.player.shotgun) state.player.weapon = 'SCATTERGUN'; else state.toast = { text: 'Find a weapon cache or visit Night Owl Supply for a scattergun', time: 4 }; }
  }
  if (input.pointer.clicked) {
    const b = renderer.buttons.find(b => input.pointer.x >= b.x && input.pointer.x <= b.x + b.w && input.pointer.y >= b.y && input.pointer.y <= b.y + b.h);
    if (b) { action(b.id); input.pointer.down = false; }
    else if (state.mission.briefing) { advanceBriefing(state); input.pointer.down = false; }
  }
  input.clear();
}
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  handleInput(); state.pointer = input.pointer;
  if (state.screen === 'title') { state.elapsed += dt; state.camera.x = 1730 + Math.sin(state.elapsed * .045) * 90; state.camera.y = 1650 + Math.cos(state.elapsed * .045) * 90; }
  updateChaseCamera(state, dt);
  const aim = renderer.unproject(input.pointer.x, input.pointer.y + (state.viewMode === '3d' ? 0 : 17));
  const old = { x: state.player.x, y: state.player.y };
  accumulator += dt;
  while (accumulator >= 1 / 60) { updateWorld(state, input, aim, 1 / 60); accumulator -= 1 / 60; }
  state.walking = Math.hypot(state.player.x - old.x, state.player.y - old.y) > .1;
  if (state.screen !== 'title') {
    const car = state.player.car, look = car ? Math.min(140, Math.abs(car.speed) * .3) : 0;
    const x = state.player.x + Math.cos(state.player.angle) * look, y = state.player.y + Math.sin(state.player.angle) * look;
    state.camera.x = lerp(state.camera.x, x, 1 - Math.exp(-dt * 5)); state.camera.y = lerp(state.camera.y, y, 1 - Math.exp(-dt * 5)); state.camera.zoom = lerp(state.camera.zoom, car ? 1 : 1.22, dt * 2);
  }
  audio.update(dt, state); renderer.draw(state, !!save, settings.volume);
}
if (shot) {
  stageShot(state, shot); renderer.draw(state, true, settings.volume); window.__shotReady = true;
} else {
  state.camera = { x: 1730, y: 1730, zoom: 1.06 }; requestAnimationFrame(frame);
}
window.addEventListener('blur', () => { if (!shot && state.screen === 'play') state.screen = 'pause'; });
// Read-only inspection for local QA and accessible state announcements.
window.copperBay = { get state() { return state; }, get ready() { return true; } };
