// A repeatable timed coastal circuit with a physical rival and persistent best time.
import { distance, angleDelta, clamp } from './math.js';
import { makeCar, moveCar } from './vehicles.js';
import { awardReputation } from './progression.js';
import { writeSave } from './save.js';
export const STREET_RACE = { x: 320, y: 1280, name: 'SOLARIS SPRINT', icon: '⚑', reward: 900 };
export const RACE_ROUTE = [{ x: 320, y: 800 }, { x: 1280, y: 800 }, { x: 1280, y: 1760 }, { x: 320, y: 1760 }, { x: 320, y: 1280 }];
export function startRace(state) {
  if (state.activity) { state.activity = null; state.cars = state.cars.filter(c => !c.rival); state.toast = { text: 'SOLARIS SPRINT · Race abandoned', time: 3 }; return; }
  if (!state.player.car || distance(state.player, STREET_RACE) > 160) { state.toast = { text: 'RACE · Bring a car to Solaris Beach. Look for the checkered flag on M.', time: 5 }; return; }
  const rival = makeCar(348, 1200, 'coupe', '#b99be5', -Math.PI / 2);
  rival.rival = true; state.cars.push(rival);
  state.activity = { checkpoint: 0, rivalCheckpoint: 0, elapsed: 0, remaining: 120, rival };
  state.toast = { text: 'SOLARIS SPRINT · Beat the rival. Five gates. $900 on the line.', time: 5 }; state.audio.sound('cash');
}
export function activityTarget(state) { return state.activity ? RACE_ROUTE[state.activity.checkpoint] : null; }
export function updateActivities(state, dt) {
  state.progression.banner = Math.max(0, state.progression.banner - dt);
  const a = state.activity; if (!a) return;
  a.elapsed += dt; a.remaining -= dt;
  const target = RACE_ROUTE[a.rivalCheckpoint];
  if (target && !a.rival.wreck) {
    const angle = Math.atan2(target.y - a.rival.y, target.x - a.rival.x), turn = angleDelta(angle, a.rival.angle);
    moveCar(state, a.rival, a.rival.speed < (Math.abs(turn) > .5 ? 95 : 205) ? 1 : 0, clamp(turn * 2, -1, 1), Math.abs(turn) > 1, dt);
    if (distance(a.rival, target) < 95) a.rivalCheckpoint++;
  }
  if (state.player.car && distance(state.player, activityTarget(state)) < 105) {
    a.checkpoint++; state.audio.sound('cash');
    state.effects.burst(state.player.x, state.player.y, '#a1f2cc', 24, 110, 25);
  }
  if (a.checkpoint === RACE_ROUTE.length) {
    const won = a.rivalCheckpoint < RACE_ROUTE.length, payout = won ? 900 : 300;
    state.player.money += payout; state.progression.races++;
    if (!state.progression.bestRace || a.elapsed < state.progression.bestRace) state.progression.bestRace = a.elapsed;
    awardReputation(state, won ? 250 : 100);
    state.toast = { text: `${won ? 'RACE WON' : 'RACE FINISHED'} · ${a.elapsed.toFixed(1)}s · +$${payout} · +${won ? 250 : 100} REP`, time: 8 };
    state.activity = null; state.cars = state.cars.filter(c => !c.rival); writeSave(state);
  } else if (a.remaining <= 0 || state.screen === 'wasted' || state.screen === 'busted') {
    state.activity = null; state.cars = state.cars.filter(c => !c.rival);
    state.toast = { text: 'RACE EXPIRED · Solaris Sprint is ready for another run', time: 5 };
  }
}
export function drawRaceGate(p, state) {
  const target = activityTarget(state) || STREET_RACE;
  if (!state.activity && distance(state.player, STREET_RACE) > 320) return;
  if (!p.visible(target.x, target.y, 100)) return;
  const q = p.project(target.x, target.y, 64);
  for (const dx of [-60, 60]) p.prism(target.x + dx, target.y - 5, 8, 10, 45, '#ffe9ae', '#fdb06e', '#b88863');
  p.ctx.strokeStyle = '#ffe18ca0'; p.ctx.lineWidth = 3; p.ctx.beginPath(); p.ctx.ellipse(q.x, q.y + 55 * p.view.zoom, 70 * p.view.zoom, 23 * p.view.zoom, 0, 0, Math.PI * 2); p.ctx.stroke();
  p.text(state.activity ? `${state.activity.checkpoint + 1} / 5` : '⚑  SOLARIS SPRINT', q.x, q.y, 15 * p.view.zoom, '#fff2b9', '900', 'center');
  if (!state.activity) p.text('R  RACE · $900', q.x, q.y + 19 * p.view.zoom, 11 * p.view.zoom, '#fff7df', '800', 'center');
}
