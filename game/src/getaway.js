import { distance } from './math.js';
import { ejectDriver } from './vehicles.js';

const PARKING_BAY = { x: 525, y: 1100 };

export function setUpGetaway(state) {
  const car = state.addCar(PARKING_BAY.x, PARKING_BAY.y, 'coupe', '#d96847', -.19);
  car.driver = true;
  car.parked = true;
  const ally = { x: 503, y: 1168, hp: 100, angle: -.9, color: '#328c88', seed: 207, flee: 0, sceneActor: true, ally: 'SOL' };
  state.peds.push(ally);
  state.getaway = { car, ally, ready: false };
  return state.getaway;
}

export function updateGetaway(state, dt) {
  const scene = state.getaway;
  if (!scene || !state.mission.active || state.mission.index !== 1 || state.mission.step < 1) return;
  const { car, ally } = scene;
  if (car.stolen || car.wreck || ally.hp <= 0 || state.mission.step > 1) {
    ally.sceneActor = false;
    state.getaway = null;
    return;
  }
  const door = { x: car.x - 8, y: car.y + 29 };
  const target = scene.ready ? { x: car.x - 40, y: car.y + 66 } : door;
  const d = distance(ally, target);
  if (d > 7) {
    ally.angle = Math.atan2(target.y - ally.y, target.x - ally.x);
    const speed = Math.min(d, dt * 93);
    ally.x += Math.cos(ally.angle) * speed;
    ally.y += Math.sin(ally.angle) * speed;
  } else if (!scene.ready) {
    ejectDriver(state, car);
    car.getaway = true;
    scene.ready = true;
  }
}
