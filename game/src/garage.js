// Ghost Customs services apply to the driven vehicle and the owned upgrade package.
import { reputation } from './progression.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { writeSave } from './save.js';
export function garageService(state, service) {
  const p = state.player, car = p.car; if (!car) return;
  const level = reputation(state).level;
  const specs = { repair: [250, 0], turbo: [800, 1], chassis: [600, 2] };
  const [price, rank] = specs[service] || [0, 99];
  if (level < rank) { state.toast = { text: 'Earn reputation from story jobs and Solaris Sprint to unlock this part.', time: 5 }; return; }
  if (p.money < price) { state.toast = { text: 'GHOST CUSTOMS · Not enough cash', time: 3 }; return; }
  if (service !== 'repair' && state.progression[service]) { state.toast = { text: 'GHOST CUSTOMS · Upgrade already installed', time: 3 }; return; }
  p.money -= price;
  if (service === 'repair') {
    car.hp = VEHICLE_TYPES[car.type].hp + (state.progression.chassis ? 80 : 0);
    car.reinforced = !!state.progression.chassis;
    car.color = ['#f98462', '#66d7c2', '#e9b869'][Math.floor(state.elapsed) % 3]; state.heat = 0; state.helicopter = null;
  } else {
    state.progression[service] = true;
    if (service === 'chassis') { car.hp += 80; car.reinforced = true; }
  }
  state.toast = { text: `GHOST CUSTOMS · ${service === 'repair' ? 'Repaired, resprayed, heat cleared' : service === 'turbo' ? 'Stage II engine installed' : 'Reinforced chassis installed'} −$${price}`, time: 5 };
  state.audio.sound('cash'); writeSave(state);
}
export function drawGarage(p, state, button, panel) {
  const x = 910, y = 270;
  panel(x, y, 338, 330, .96);
  p.text('GHOST CUSTOMS', x + 22, y + 36, 25, '#ffd080', '900');
  p.text('DOCKSIDE PERFORMANCE & PAINT', x + 23, y + 58, 10, '#a9c3c4', '800');
  const rank = reputation(state).level;
  button('repair', 'REPAIR & RESPRAY', '$250', x + 17, y + 80, 304, true);
  button('turbo', 'STAGE II ENGINE', state.progression.turbo ? 'FITTED ✓' : rank < 1 ? 'REP 300' : '$800', x + 17, y + 148, 304, false, state.progression.turbo || rank < 1);
  button('chassis', 'REINFORCED BODY', state.progression.chassis ? 'FITTED ✓' : rank < 2 ? 'REP 900' : '$600', x + 17, y + 216, 304, false, state.progression.chassis || rank < 2);
  p.text('E / ESC   BACK TO THE STREETS', x + 22, y + 310, 12, '#7fe6c7', '800');
}
