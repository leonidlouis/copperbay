import { GARAGE_PRICES } from './garage.js';
import { GARAGE_CARS } from './progression.js';
import { VEHICLE_TYPES } from './vehicles.js';

export function drawGarageScreen(p, state, { panel, buttons }) {
  const { ctx, text } = p;
  const x = 871, width = 378, buttonX = x + 22, buttonW = width - 44, right = x + width - 22;
  const profile = state.progression;
  panel(x, 161, width, 469, .97);
  ctx.fillStyle = '#f4ac73'; ctx.fillRect(x + 22, 184, 32, 3);
  text('PORT MERIDIAN', x + 62, 190, 13, '#ffc990', '900');
  text('GHOST CUSTOMS', x + 22, 231, 32, '#fff1d7', '900', 'left', 'Arial Black, Arial');
  text('REPAIR  /  RESPRAY  /  PERFORMANCE', x + 23, 255, 12, '#c1d4c9', '800');
  const row = (id, title, note, y, disabled, accent) => {
    ctx.fillStyle = disabled ? '#21383c' : accent ? '#f2bb83' : '#304e52';
    ctx.beginPath(); ctx.roundRect(buttonX, y, buttonW, 39, 4); ctx.fill();
    text(title, buttonX + 12, y + 25, 16, accent ? '#23373c' : '#fff1d7', '900');
    text(note, right - 11, y + 25, 13, accent ? '#31444a' : '#bbddca', '800', 'right');
    if (!disabled) buttons.push({ id, x: buttonX, y, w: buttonW, h: 39 });
  };
  row('service', 'REPAIR & RESPRAY', '$' + GARAGE_PRICES.service, 273, !state.player.car, !!state.player.car);
  row('tune', 'STREET TUNE', profile.tune ? 'INSTALLED' : profile.rep < 2 ? '2 REP' : '+12% SPEED · $700', 319, profile.tune || profile.rep < 2, false);
  text('CUSTOMS FLEET', buttonX, 388, 15, '#ffc990', '900');
  GARAGE_CARS.forEach((car, i) => {
    const owned = profile.unlockedCars.includes(car.type), locked = profile.rep < car.rep;
    const note = state.heat ? 'LOSE THE HEAT' : locked ? car.rep + ' REP' : owned ? 'COLLECT' : '$' + car.price.toLocaleString('en-US');
    row('claim-' + car.type, VEHICLE_TYPES[car.type].name, note, 401 + i * 47, locked || state.heat > 0, false);
  });
  row('closeGarage', 'BACK TO THE STREET', 'E / ESC', 558, false, false);
}
