import { drawHUD, drawDialogue } from './hud-panels.js';
import { drawCityMap } from './map-screen.js';
import { drawGarage } from './garage.js';
import { createUI } from './ui.js';
import { currentMission, missionTarget, missionObjective, STORY } from './missions.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { clamp, distance, TAU } from './math.js';
const CREAM = '#fff0d5', MUTED = '#a9c3c4', GOLD = '#ffd080', MINT = '#7fe6c7';
export function createHUD(p) {
  const { ctx, text, circle } = p;
  const buttons = [];
  const ui = createUI(p, buttons);
  function panel(x, y, w, h, alpha = .91) {
    ctx.fillStyle = `rgba(13,35,48,${alpha})`; ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill();
    ctx.strokeStyle = '#c1d2c622'; ctx.lineWidth = 1; ctx.stroke();
  }
  function label(str, x, y, color = MUTED) { text(str, x, y, 11, color, '800'); }
  function keycap(key, x, y, w = 27, dark = false) {
    ctx.fillStyle = dark ? '#203e4d' : '#e4e3c9'; ctx.beginPath(); ctx.roundRect(x, y - 18, w, 24, 4); ctx.fill(); text(key, x + w / 2, y, 12, dark ? CREAM : '#203e4b', '900', 'center');
  }
  function button(id, title, sub, x, y, w = 330, accent = false, disabled = false) {
    ctx.fillStyle = accent ? GOLD : '#203d4b'; ctx.beginPath(); ctx.roundRect(x, y, w, 58, 5); ctx.fill();
    ctx.strokeStyle = accent ? '#ffe4ac' : '#91b6b54a'; ctx.lineWidth = 1; ctx.stroke();
    text(title, x + 20, y + 36, 22, accent ? '#173747' : disabled ? '#6e8c94' : CREAM, '900');
    text(sub, x + w - 18, y + 35, 13, accent ? '#345361' : MUTED, '700', 'right');
    if (!disabled) buttons.push({ id, x, y, w, h: 58 });
  }
  function title(state, hasSave) {
    const g = ctx.createLinearGradient(0, 0, 1100, 0); g.addColorStop(0, '#0a2537fa'); g.addColorStop(.48, '#0b2a3eea'); g.addColorStop(1, '#122d3b00'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 800);
    ctx.fillStyle = GOLD; ctx.fillRect(67, 69, 39, 4); label('AN ORIGINAL OPEN WORLD CRIME STORY', 119, 75, GOLD);
    text('COPPER', 62, 220, 105, CREAM, '900', 'left', 'Arial Black, Arial'); text('BAY', 62, 317, 105, GOLD, '900', 'left', 'Arial Black, Arial');
    text('A city worth', 69, 375, 32, CREAM, '800'); text('stealing back.', 69, 414, 32, CREAM, '800');
    text('You are Mara Vale. Courier. Car thief.', 70, 452, 16, MUTED, '600'); text('The harbor owns everyone. Except you.', 70, 478, 16, MUTED, '600');
    button('new', 'NEW GAME', 'ENTER  →', 70, 515, 358, true);
    button('continue', 'CONTINUE', hasSave ? 'LOCAL SAVE  →' : 'NO SAVE YET', 70, 585, 358, false, !hasSave);
    button('controls', 'CONTROLS & AUDIO', 'C  →', 70, 655, 358);
    label('THE MERIDIAN FILES / SIX CHAPTERS', 71, 756, GOLD);
    panel(859, 491, 360, 225, .93); label('YOUR FIRST JOB', 884, 521, GOLD); text('BORROWED', 883, 561, 33, CREAM, '900'); text('WHEELS', 883, 598, 33, CREAM, '900');
    text('Steal a Cavell. Meet Inez at Pier 09.', 885, 630, 14, MUTED); text('Then find out who sold your city.', 885, 653, 14, MUTED);
    text('01 / 06', 1189, 692, 17, GOLD, '900', 'right');
  }
  function settings(state, volume) {
    ctx.fillStyle = '#0b2236da'; ctx.fillRect(0, 0, 1280, 800); panel(205, 75, 870, 650, .98);
    text('TAKE A BREATHER.', 243, 139, 40, CREAM, '900'); label('CONTROLS / SOUND', 245, 169, GOLD);
    const rows = [['WASD / ARROWS', 'Walk / accelerate, brake & steer'], ['SHIFT / SPACE', 'Sprint or nitro / handbrake in a car'], ['E', 'Enter, steal, exit, talk, use services'], ['MOUSE / CLICK', 'Aim / fire · 1/2/3 weapons · F punch'], ['M / V / G', 'City map / camera / garage near Ghost Customs'], ['K', 'Save progress anywhere when heat is clear']];
    rows.forEach(([a, b], i) => { text(a, 247, 225 + i * 47, 15, GOLD, '900'); text(b, 470, 225 + i * 47, 16, CREAM, '500'); });
    text('VOLUME', 247, 550, 15, GOLD, '900');
    button('quieter', '−', '', 470, 521, 62); text(Math.round(volume * 100) + '%', 607, 559, 23, CREAM, '900', 'center'); button('louder', '+', '', 680, 521, 62);
    button('resume', 'BACK TO THE BAY', 'ESC →', 247, 626, 352, true);
    if (state.screen === 'pause') button('save', state.heat > 0 ? 'LOSE HEAT TO SAVE' : 'SAVE GAME', 'K →', 632, 626, 352, false, state.heat > 0);
  }
  function completion(state, large = false) {
    const m = state.mission;
    if (large) {
      ctx.fillStyle = '#0b2638b8'; ctx.fillRect(0, 0, 1280, 800);
      panel(280, 154, 720, 485, .96); label('THE MERIDIAN FILES / CHAPTER CLOSED', 640 - 147, 198, MINT);
      text('MISSION PASSED', 640, 266, 52, GOLD, '900', 'center'); text(m.lastName, 640, 312, 33, CREAM, '900', 'center');
      text('+$' + m.lastPayout.toLocaleString('en-US'), 640, 380, 50, MINT, '900', 'center');
      const stats = [[state.stats.missions + ' / 6', 'STORY JOBS'], [state.stats.carsStolen, 'CARS STOLEN'], [state.stats.takedowns, 'TAKEDOWNS']];
      stats.forEach(([n, tag], i) => { const x = 426 + i * 213; text(String(n), x, 454, 31, CREAM, '900', 'center'); text(tag, x, 478, 11, MUTED, '900', 'center'); });
      label('✓ PROGRESS SAVED TO THIS BROWSER', 640 - 126, 527, MINT);
      button('resume', 'CONTINUE', 'ENTER →', 337, 558, 290, true);
      button('new', 'NEW GAME', '↻', 653, 558, 290);
    } else {
      panel(397, 226, 486, 137, .94); text('MISSION PASSED', 640, 272, 32, GOLD, '900', 'center'); text(m.lastName, 640, 304, 19, CREAM, '900', 'center'); text('+$' + m.lastPayout.toLocaleString('en-US') + '  ·  PROGRESS SAVED', 640, 338, 17, MINT, '900', 'center');
    }
  }
  function death(state) {
    ctx.fillStyle = '#182237cf'; ctx.fillRect(0, 0, 1280, 800);
    const busted = state.screen === 'busted';
    text(busted ? 'BUSTED' : 'WASTED', 640, 346, 108, busted ? '#99c8f0' : '#f88984', '900', 'center', 'Arial Black, Arial');
    text(busted ? 'The harbor has long arms.' : 'Every city takes its cut.', 640, 397, 24, CREAM, '700', 'center');
    text(`MARA VALE  /  ${state.stats.missions} JOBS  /  $${Math.floor(state.player.money)}`, 640, 450, 16, MUTED, '700', 'center');
    button('restart', 'BACK TO THE SAFEHOUSE', 'ENTER →', 425, 500, 430, true);
  }
  function shop(state) {
    ctx.fillStyle = '#0b2439b3'; ctx.fillRect(0, 0, 1280, 800); panel(331, 100, 618, 600, .97);
    text('NIGHT OWL SUPPLY', 367, 164, 35, GOLD, '900'); text('A little insurance for a long night.', 367, 195, 17, MUTED);
    button('ammo', '60 PISTOL ROUNDS', '$80', 368, 235, 543);
    button('armor', 'BODY ARMOR', '$180', 368, 306, 543);
    button('health', 'FIRST AID', '$100', 368, 377, 543);
    button('shotgun', 'SCATTERGUN + 30 ROUNDS', '$650', 368, 448, 543);
    text('1 PISTOL / 2 FISTS / 3 SCATTERGUN', 369, 545, 13, MUTED, '700');
    button('closeShop', 'BACK TO BUSINESS', 'E →', 368, 590, 543, true);
  }
  function ending(state) {
    ctx.fillStyle = '#102e3fdc'; ctx.fillRect(0, 0, 1280, 800);
    label('FREE BAY RADIO / 88.4 FM', 475, 181, MINT);
    text('THE BAY IS FREE.', 640, 282, 65, GOLD, '900', 'center');
    text('“The truth belongs to everyone.”', 640, 349, 28, CREAM, '700', 'center');
    text('— Ada Wren, the morning after', 640, 388, 17, MUTED, '700', 'center');
    text('Six jobs. One city. Your story is on every radio.', 640, 449, 20, CREAM, '500', 'center');
    button('resume', 'KEEP EXPLORING', 'ENTER →', 425, 514, 430, true);
  }
  return {
    buttons,
    draw(state, hasSave, volume) {
      buttons.length = 0;
      if (state.screen === 'title') title(state, hasSave);
      else if (state.garageOpen) drawGarage(ui, state);
      else {
        drawHUD(ui, state);
        if (state.mission.briefing) drawDialogue(ui, state);
        if (state.mapOpen) drawCityMap(ui, state);
        if (state.shopOpen) shop(state);
        if (state.mission.banner > 0 && state.screen === 'play' && !state.mission.briefing) completion(state);
        if (state.screen === 'complete') completion(state, true);
        if (state.screen === 'wasted' || state.screen === 'busted') death(state);
        if (state.screen === 'ending') ending(state);
      }
      if (state.screen === 'pause' || state.settingsOpen) settings(state, volume);
    },
  };
}
