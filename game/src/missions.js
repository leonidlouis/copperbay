import { distance } from './math.js';
import { writeSave } from './save.js';
export const STORY = [
  { name: 'BORROWED WHEELS', contact: 'INEZ ROOK', role: 'Mechanic / your oldest friend', payout: 600, start: { x: 855, y: 790 }, dialogue: ['Welcome home, Mara. The harbor bought this city.', 'I borrowed their ledger. Borrow some wheels.', 'Take the Cavell outside. Meet me at Pier 09.'], steps: [
    { type: 'steal', text: 'Get in the coral Cavell outside the garage.', target: { x: 825, y: 825 } },
    { type: 'drive', text: 'Drive the Cavell to Inez at Pier 09.', target: { x: 825, y: 3200 } },
  ] },
  { name: 'PAPER TRAIL', contact: 'INEZ ROOK', role: 'A ledger, a debt, a way out', payout: 1200, start: { x: 825, y: 3200 }, dialogue: ['This ledger lists every bribe the port ever paid.', 'The missing pages are in Crown Quarter.', 'Voss has guards there. Bring the pages back alive.'], steps: [
    { type: 'reach', text: 'Find Voss’s couriers in Crown Quarter.', target: { x: 1085, y: 2400 }, spawn: true },
    { type: 'defeat', text: 'Take down the three couriers. Recover the pages.', target: { x: 1085, y: 2400 }, enemies: 3 },
    { type: 'reach', text: 'Collect the missing pages.', target: { x: 1085, y: 2400 } },
  ] },
  { name: 'GOLDEN HOUR', contact: 'SOL NAVARRO', role: 'Driver / professional optimist', payout: 1800, start: { x: 1085, y: 2400 }, dialogue: ['Port security are jamming our radio link.', 'I’ve got a van full of transmitters. They’re fragile.', 'Get it to the hills in under two minutes. No fireworks.'], steps: [
    { type: 'steal', text: 'Find a vehicle. The hills are a long walk.', target: { x: 1085, y: 2240 } },
    { type: 'drive', text: 'Deliver the transmitters to Verdigris Hills.', target: { x: 3200, y: 800 }, limit: 120 },
  ] },
  { name: 'CUT THE STATIC', contact: 'ADA WREN', role: 'Free Bay Radio / voice of the city', payout: 2400, start: { x: 3200, y: 800 }, dialogue: ['Voss put a jammer in a port security van.', 'It’s parked behind the Copper Club.', 'Destroy the van. Give this city its voice back.'], steps: [
    { type: 'reach', text: 'Find the jammer van on Saffron Strip.', target: { x: 1280, y: 895 }, jammer: true },
    { type: 'destroy', text: 'Destroy the marked security van.', target: { x: 1280, y: 895 } },
    { type: 'evade', text: 'Lose the police. Stay out of sight.', target: null },
  ] },
  { name: 'DEAD AIR', contact: 'ADA WREN', role: 'The whole city is listening', payout: 3600, start: { x: 1280, y: 895 }, dialogue: ['The ledger is ready to broadcast. Voss knows.', 'Every patrol in Copper Bay is looking for you.', 'Bring it to Free Bay Radio. I’ll keep the light on.'], steps: [
    { type: 'drive', text: 'Deliver the ledger to Free Bay Radio.', target: { x: 3200, y: 800 }, heat: 3 },
    { type: 'evade', text: 'Lose your wanted level before the broadcast.', target: null },
  ] },
  { name: 'A CITY WORTH STEALING', contact: 'MARA VALE', role: 'One last delivery', payout: 6000, start: { x: 3200, y: 800 }, dialogue: ['Voss is fleeing from Pier 09 with the city’s money.', 'Inez is already there. She needs backup.', 'One last delivery. Then Copper Bay belongs to itself.'], steps: [
    { type: 'reach', text: 'Return to Pier 09. Back up Inez.', target: { x: 825, y: 3200 }, spawn: true },
    { type: 'defeat', text: 'Stop Voss’s four enforcers at the docks.', target: { x: 825, y: 3200 }, enemies: 4 },
    { type: 'evade', text: 'Escape the last patrols. Let Ada tell the story.', target: null },
    { type: 'reach', text: 'Go home. Inez is waiting at your garage.', target: { x: 855, y: 790 } },
  ] },
];
export function createMissionState(index = 0) { return { index, step: 0, active: false, briefing: false, radio: false, dialogue: 0, timer: 0, spawned: false, banner: 0, lastPayout: 0, lastName: '', complete: false }; }
export function currentMission(state) { return STORY[Math.min(state.mission.index, STORY.length - 1)]; }
export function currentStep(state) { return state.mission.active ? currentMission(state).steps[state.mission.step] : null; }
export function missionTarget(state) {
  if (state.mission.complete) return null;
  if (!state.mission.active) return currentMission(state).start;
  return currentStep(state)?.target;
}
export function missionObjective(state) {
  if (state.mission.complete) return 'The city is yours. Explore Copper Bay.';
  if (!state.mission.active) return 'Meet ' + currentMission(state).contact + ' · E to talk';
  return currentStep(state)?.text || 'Find your next move.';
}
export function startBriefing(state) {
  state.mission.briefing = true; state.mission.radio = false; state.mission.dialogue = 0; state.audio.sound('click');
}
export function advanceBriefing(state) {
  const m = state.mission;
  m.dialogue++;
  if (m.dialogue >= currentMission(state).dialogue.length) {
    m.briefing = false;
    if (m.radio) { m.radio = false; return; }
    m.active = true; m.step = 0; m.timer = 0; m.spawned = false;
    enterStep(state);
  }
}
function enterStep(state) {
  const step = currentStep(state), m = state.mission;
  if (!step) return;
  m.timer = step.limit || 0;
  if (step.heat) { state.heat = step.heat; state.lastCrime = state.elapsed; }
  if (step.spawn && !m.spawned) {
    m.spawned = true;
    const count = currentMission(state).steps.find(s => s.enemies)?.enemies || 3;
    for (let i = 0; i < count; i++) state.peds.push({ x: step.target.x + (i - 1) * 37, y: step.target.y + 35 + (i % 2) * 35, angle: Math.PI, hp: 85, enemy: true, police: false, color: '#d47c73', flee: 0, seed: i, cooldown: 1 });
  }
  if (step.jammer) {
    const car = state.addCar(step.target.x, step.target.y, 'van', '#546e7e'); car.jammer = true; car.parked = true;
  }
}
export function completeMission(state) {
  const m = state.mission, story = currentMission(state);
  state.player.money += story.payout; state.player.health = Math.min(100, state.player.health + 25); state.player.ammo += 24;
  m.lastName = story.name; m.lastPayout = story.payout; m.banner = 0; state.screen = 'complete'; m.index++; m.active = false; m.step = 0; m.spawned = false;
  state.stats.missions++; state.audio.sound('cash');
  if (m.index >= STORY.length) { m.complete = true; state.screen = 'ending'; }
  writeSave(state);
}
export function updateMissions(state, dt) {
  const m = state.mission;
  m.banner = Math.max(0, m.banner - dt);
  if (!m.active || m.briefing || m.complete) return;
  const step = currentStep(state), p = state.player;
  let done = false;
  if (step.limit) {
    m.timer -= dt;
    if (m.timer <= 0) { m.active = false; state.toast = { text: 'DELIVERY MISSED · Return to Sol to try again', time: 5 }; return; }
  }
  if (step.type === 'steal') done = !!p.car;
  if (step.type === 'reach') done = distance(p, step.target) < 80;
  if (step.type === 'drive') done = !!p.car && distance(p, step.target) < 95;
  if (step.type === 'defeat') done = !state.peds.some(ped => ped.enemy && ped.hp > 0);
  if (step.type === 'destroy') done = state.cars.some(c => c.jammer && c.wreck);
  if (step.type === 'evade') done = state.heat <= 0;
  if (done) {
    state.audio.sound('cash'); state.effects.burst(p.x, p.y, '#71e3cc', 18, 100, 20);
    m.step++;
    if (m.step >= currentMission(state).steps.length) completeMission(state);
    else { enterStep(state); state.toast = { text: 'OBJECTIVE UPDATED · ' + currentStep(state).text, time: 4 }; }
  }
}
