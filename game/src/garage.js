import { PLACES } from './city.js';
import { distance } from './math.js';
import { GARAGE_CARS } from './progression.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { writeSave } from './save.js';

export const GARAGE_PRICES = { service: 250, tune: 700 };
const PAINT = ['#f17e58', '#59bbae', '#e0b65e', '#af80ab'];

export function nearGarage(state) {
  return distance(state.player, PLACES.garage) < 125;
}

export function useGarage(state, id) {
  if (!state.garageOpen || !nearGarage(state)) return;
  const p = state.player, profile = state.progression;
  const offer = GARAGE_CARS.find(car => id === 'claim-' + car.type);
  const owned = offer && profile.unlockedCars.includes(offer.type);
  const price = offer ? (owned ? 0 : offer.price) : GARAGE_PRICES[id];
  if (price === undefined || p.money < price) {
    state.toast = { text: 'GHOST CUSTOMS · Insufficient cash', time: 3 };
    return;
  }
  if (id === 'service') {
    if (!p.car) return;
    p.car.hp = VEHICLE_TYPES[p.car.type].hp;
    p.car.color = PAINT[(PAINT.indexOf(p.car.color) + 1) % PAINT.length];
    state.heat = 0;
    state.unseen = 0;
    state.toast = { text: 'GHOST CUSTOMS · Repaired, resprayed and heat cleared', time: 4 };
  } else if (id === 'tune') {
    if (profile.tune || profile.rep < 2) return;
    profile.tune = true;
    if (p.car) p.car.tuned = true;
    state.toast = { text: 'STREET TUNE INSTALLED · +12% top speed', time: 4 };
  } else if (offer) {
    if (state.heat || profile.rep < offer.rep) return;
    if (!owned) profile.unlockedCars.push(offer.type);
    let car = state.cars.find(c => c.garageVehicle && c.type === offer.type && !c.wreck);
    const old = p.car;
    if (old && old !== car) {
      old.x = PLACES.garage.x + 70;
      old.y = PLACES.garage.y + 40;
      old.speed = old.vx = old.vy = 0;
      old.parked = true;
    }
    if (!car) car = state.addCar(PLACES.garage.x, PLACES.garage.y, offer.type, offer.color, 0);
    car.garageVehicle = true;
    car.x = PLACES.garage.x;
    car.y = PLACES.garage.y;
    car.speed = car.vx = car.vy = 0;
    car.parked = false;
    car.tuned = profile.tune;
    p.car = car;
    p.x = car.x;
    p.y = car.y;
    state.toast = { text: VEHICLE_TYPES[offer.type].name + ' · Ready in the customs bay', time: 4 };
  }
  p.money -= price;
  state.audio.sound('cash');
  if (!state.heat) writeSave(state);
}
