import { distance } from './math.js';
import { awardReputation } from './progression.js';
import { writeSave } from './save.js';

export const TRIALS = [
  {
    id: 'paloma', name: 'PALOMA SPRINT', prize: 850, limit: 45,
    gates: [
      { x: 351, y: 1665 }, { x: 351, y: 1280 }, { x: 351, y: 800 },
      { x: 800, y: 830 }, { x: 1280, y: 830 }, { x: 1250, y: 1280 },
    ],
  },
  {
    id: 'customs', name: 'PORT LOOP', prize: 1100, limit: 56,
    gates: [
      { x: 1307, y: 3260 }, { x: 1307, y: 3680 }, { x: 800, y: 3650 },
      { x: 351, y: 3650 }, { x: 351, y: 3200 }, { x: 351, y: 2720 }, { x: 800, y: 2749 },
    ],
  },
];

export function nearbyTrial(state) {
  return TRIALS.find(trial => distance(state.player, trial.gates[0]) < 85);
}

export function trialTarget(state) {
  return state.trial?.course.gates[state.trial.gate];
}

export function interactWithTrial(state) {
  const trial = nearbyTrial(state);
  if (!trial || state.trial) return false;
  if (!state.player.car || state.heat > 0) {
    state.toast = { text: 'TIME TRIAL · Bring a car and clear your wanted level', time: 3 };
    return true;
  }
  if (state.mission.active && state.mission.timer > 0) {
    state.toast = { text: 'Finish the timed delivery before starting a trial', time: 3 };
    return true;
  }
  state.trial = { course: trial, gate: 1, time: 0, car: state.player.car };
  state.toast = { text: trial.name + ' · GO!', time: 2.1 };
  state.audio.sound('click');
  return true;
}

export function updateTrial(state, dt) {
  const run = state.trial;
  if (!run) return;
  const { course } = run;
  run.time += dt;
  if (run.car !== state.player.car || run.time > course.limit) {
    state.toast = { text: course.name + ' · Run ended. Return to the start to retry.', time: 4 };
    state.trial = null;
    return;
  }
  if (distance(state.player, course.gates[run.gate]) >= 68) return;
  run.gate++;
  state.audio.sound('cash');
  state.effects.burst(state.player.x, state.player.y, '#a6f7cd', 14, 105, 16);
  if (run.gate < course.gates.length) return;
  const previous = state.progression.records[course.id];
  const best = !previous || previous > run.time;
  const payout = previous ? Math.round(course.prize * .4) : course.prize;
  if (best) state.progression.records[course.id] = run.time;
  if (!previous) awardReputation(state, 2);
  state.player.money += payout;
  state.trial = null;
  state.toast = { text: `${course.name} · ${run.time.toFixed(1)}s · +$${payout}${best ? ' · PERSONAL BEST' : ''}`, time: 6 };
  if (!state.heat) writeSave(state);
}
