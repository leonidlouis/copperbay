import { BEACH_EDGE, ROAD_CENTERS, PLACES, districtAt } from './city.js';
import { currentMission, missionTarget, missionObjective, STORY } from './missions.js';
import { VEHICLE_TYPES, topSpeed } from './vehicles.js';
import { TRIALS, nearbyTrial } from './activities.js';
import { nearGarage } from './garage.js';
import { drawMapScreen } from './map-screen.js';
import { drawGarageScreen } from './garage-screen.js';
import { clamp, distance, TAU } from './math.js';
const CREAM = '#fff0d5', MUTED = '#a9c3c4', GOLD = '#ffd080', MINT = '#7fe6c7';
export function createHUD(p) {
  const { ctx, text, circle } = p;
  const buttons = [];
  function panel(x, y, w, h, alpha = .91) {
    ctx.fillStyle = `rgba(22,43,48,${alpha})`; ctx.beginPath(); ctx.roundRect(x, y, w, h, 9); ctx.fill();
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
  function minimap(state, cx = 124, cy = 648, radius = 88) {
    const player = state.player, target = missionTarget(state);
    const run = state.trial;
    const way = run ? run.course.gates[run.gate] : target;
    const rate = .16;
    const map = (x, y) => ({ x: cx + (x - player.x) * rate, y: cy + (y - player.y) * rate });
    const land = map(190, 190), beach = map(BEACH_EDGE, 245);
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.clip();
    ctx.fillStyle = '#3c8587'; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = '#d6bb91'; ctx.fillRect(beach.x, beach.y, (190 - BEACH_EDGE) * rate, 2225 * rate);
    ctx.fillStyle = '#3c5e5d'; ctx.fillRect(land.x, land.y, 3790 * rate, 3790 * rate);
    ctx.strokeStyle = '#83928b'; ctx.lineWidth = 149 * rate; ctx.beginPath();
    for (const v of ROAD_CENTERS) {
      let a = map(v, 190), b = map(v, 3970); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
      a = map(190, v); b = map(3970, v); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
    }
    ctx.stroke(); ctx.strokeStyle = '#283f4a'; ctx.lineWidth = 114 * rate; ctx.stroke();
    if (way) {
      const t = map(way.x, way.y);
      ctx.strokeStyle = run ? '#94ebc5' : '#f5ce78'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.beginPath();
      ctx.moveTo(cx, cy); ctx.lineTo(t.x, cy); ctx.lineTo(t.x, t.y); ctx.stroke(); ctx.setLineDash([]);
      const dx = t.x - cx, dy = t.y - cy, f = Math.min(1, (radius - 10) / (Math.hypot(dx, dy) || 1));
      const x = cx + dx * f, y = cy + dy * f;
      p.poly([{ x, y: y - 6 }, { x: x + 6, y }, { x, y: y + 6 }, { x: x - 6, y }], run ? MINT : GOLD, '#fff0d1');
    }
    for (const place of Object.values(PLACES)) { const q = map(place.x, place.y); circle(q.x, q.y, 3, MINT); }
    for (const trial of TRIALS) { const q = map(trial.gates[0].x, trial.gates[0].y); circle(q.x, q.y, 4, '#bfc9ee'); }
    for (const car of state.cars) {
      if (car === player.car || car.wreck || !car.driver) continue;
      const q = map(car.x, car.y);
      circle(q.x, q.y, car.police && state.heat ? 4.3 : 2.4, car.police && state.heat ? '#ff777c' : '#b6c9c0b0');
    }
    if (state.air && !state.air.departing) {
      const q = map(state.air.x, state.air.y);
      circle(q.x, q.y, 6.5, '#26354c');
      text('+', q.x, q.y + 4, 12, '#f5a79d', '900', 'center');
    }
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(player.angle + Math.PI / 2);
    p.poly([{ x: 0, y: -9 }, { x: 6, y: 6 }, { x: 0, y: 3 }, { x: -6, y: 6 }], '#ffffff', '#162d38'); ctx.restore();
    ctx.restore(); ctx.strokeStyle = '#263d42'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(cx, cy, radius + 2, 0, TAU); ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = '#f5d9a8'; ctx.stroke();
    circle(cx, cy - radius, 10, '#263d42');
    text('N', cx, cy - radius + 4, 11, CREAM, '900', 'center');
  }
  function wordmark() {
    panel(28, 26, 234, 65, .91);
    ctx.save(); ctx.beginPath(); ctx.arc(62, 57, 21, 0, TAU); ctx.clip();
    circle(62, 57, 21, '#f7c384'); circle(61, 53, 12, '#ed8973');
    for (let i = 0; i < 4; i++) { ctx.fillStyle = '#29484a'; ctx.fillRect(40, 58 + i * 6, 45, 2 + i * .7); }
    ctx.restore();
    text('COPPER BAY', 92, 57, 23, CREAM, '900', 'left', 'Arial Black, Arial');
    text('THE MERIDIAN FILES', 94, 74, 10, GOLD, '900');
  }
  function drawHud(state) {
    const pl = state.player, m = state.mission, story = currentMission(state), target = missionTarget(state);
    wordmark();
    const district = districtAt(pl.x, pl.y);
    const hour = String(Math.floor(state.time)).padStart(2, '0');
    const minute = String(Math.floor((state.time % 1) * 60)).padStart(2, '0');
    panel(28, 99, 234, 32, .87);
    text(district.name, 41, 120, 14, CREAM, '900');
    text(hour + ':' + minute, 249, 120, 13, GOLD, '900', 'right');

    panel(1003, 26, 246, 126, .94);
    text('$' + Math.floor(pl.money).toLocaleString('en-US'), 1230, 62, 32, MINT, '900', 'right');
    for (let i = 0; i < 5; i++) text('★', 1040 + i * 43, 103, 31, i < Math.ceil(state.heat) ? GOLD : '#567276', '900', 'center');
    const pursuit = state.unseen > 3 ? 'SEARCHING · STAY OUT OF SIGHT' : state.air && !state.air.departing ? 'PURSUIT · AIR ONE ACTIVE' : state.heat ? 'POLICE PURSUIT' : 'NO ACTIVE WARRANT';
    text(pursuit, 1230, 130, 13, state.heat && state.unseen <= 3 ? '#ffa192' : '#c6d6c9', '900', 'right');

    if (!state.garageOpen) {
      panel(1003, 161, 246, 80, .91);
      const car = pl.car;
      label(car ? VEHICLE_TYPES[car.type].name : pl.weapon, 1017, 182, CREAM);
      text(car ? (car.stolen ? 'STOLEN' : 'VEHICLE') : pl.ammo + ' RDS', 1233, 183, 15, GOLD, '900', 'right');
      const health = car ? clamp(car.hp / VEHICLE_TYPES[car.type].hp, 0, 1) : pl.health / 100;
      ctx.fillStyle = '#48616c'; ctx.fillRect(1065, 194, 165, 6); ctx.fillStyle = MINT; ctx.fillRect(1065, 194, 165 * health, 6);
      ctx.fillStyle = '#48616c'; ctx.fillRect(1065, 217, 165, 4); ctx.fillStyle = '#8abdea'; ctx.fillRect(1065, 217, 165 * pl.armor / 100, 4);
      label(car ? 'CAR HP' : 'HEALTH', 1017, 201);
      label(car ? pl.weapon : 'ARMOR', 1017, 222);
    }
    minimap(state);
    panel(28, 748, 193, 28, .94); text(district.tag, 124, 767, 13, CREAM, '900', 'center');
    panel(245, 658, 789, 78, .94);
    ctx.fillStyle = GOLD; ctx.fillRect(245, 669, 4, 55);
    const chapter = String(Math.min(m.index + 1, STORY.length)).padStart(2, '0');
    label(m.complete ? 'THE MERIDIAN FILES · COMPLETE' : 'CHAPTER ' + chapter + ' / ' + story.name, 270, 682, GOLD);
    const objective = missionObjective(state);
    text(objective, 270, 714, objective.length > 58 ? 21 : 24, CREAM, '800');
    if (target) text(Math.round(distance(pl, target)) + ' m', 1013, 682, 13, MUTED, '700', 'right');
    if (m.timer > 0) text(Math.ceil(m.timer) + 's', 1012, 714, 22, '#ff9d86', '900', 'right');
    const keys = pl.car ? [['WASD', 'drive', 47], ['SPACE', 'handbrake', 55], ['E', 'exit', 25], ['M', 'map', 25], ['ESC', 'pause', 39]] : [['WASD', 'move', 47], ['SHIFT', 'sprint', 47], ['E', 'steal / talk', 25], ['LMB', 'fire', 39], ['F', 'punch', 25], ['M', 'map', 25]];
    panel(245, 746, 789, 35, .89);
    let x = 259;
    for (const [key, name, w] of keys) { keycap(key, x, 773, w); text(name, x + w + 7, 773, 12, CREAM, '700'); x += w + name.length * 6 + 27; }
    if (pl.car) {
      panel(1052, 655, 197, 118, .9);
      text(String(Math.round(Math.abs(pl.car.speed) * .23)).padStart(3, '0'), 1070, 717, 53, CREAM, '900'); label('KM/H', 1199, 715, MUTED);
      const v = Math.abs(pl.car.speed) / topSpeed(pl.car);
      for (let i = 0; i < 14; i++) { ctx.fillStyle = i / 14 < v ? i > 10 ? '#ff967a' : MINT : '#2b4b58'; ctx.fillRect(1071 + i * 11, 737 - i * .5, 7, 15 + i * .5); }
    }
    if (state.trial) trialHud(state);
    if (state.saved > 0 && !state.garageOpen) label('✓ LOCAL SAVE', 1146, 236, MINT);
    if (state.toast.time > 0 && !m.briefing && !m.banner && !state.rankNotice?.time) {
      const w = Math.min(760, state.toast.text.length * 7 + 40); panel(640 - w / 2, 139, w, 38, .86); text(state.toast.text, 640, 164, 13, CREAM, '700', 'center');
    }
    if ((!m.briefing || m.radio) && !state.shopOpen && !state.garageOpen) {
      let prompt = '';
      const nearbyCar = pl.car ? null : state.cars.filter(c => !c.wreck && distance(c, pl) < 90).sort((a, b) => distance(a, pl) - distance(b, pl))[0];
      if (!m.active && target && distance(pl, target) < 120) prompt = 'Talk to ' + story.contact;
      else if (nearGarage(state)) prompt = 'Ghost Customs';
      else if (nearbyCar) prompt = (nearbyCar.getaway ? 'Take ' : nearbyCar.driver ? 'Steal ' : 'Enter ') + VEHICLE_TYPES[nearbyCar.type].name;
      else if (nearbyTrial(state) && !state.trial) prompt = nearbyTrial(state).name;
      if (prompt) {
        panel(504, 581, 254, 41, .94); keycap('E', 516, 606, 23);
        text(prompt, 548, 606, 16, CREAM, '800');
      }
    }
  }
  function dialogue(state) {
    const story = currentMission(state), m = state.mission;
    if (m.radio) {
      panel(28, 161, 360, 157, .97);
      ctx.fillStyle = GOLD; ctx.fillRect(28, 177, 4, 125);
      text('RADIO  /  ' + story.contact, 46, 190, 15, GOLD, '900');
      const words = story.dialogue[m.dialogue].split(' ');
      let line = '', y = 229;
      for (const word of words) {
        if ((line + word).length > 31) { text(line, 46, y, 20, CREAM, '700'); line = ''; y += 25; }
        line += word + ' ';
      }
      text(line, 46, y, 20, CREAM, '700');
      keycap('↵', 46, 297, 24);
      text('End / advance call', 81, 297, 13, MUTED, '700');
      text((m.dialogue + 1) + ' / ' + story.dialogue.length, 369, 297, 13, MUTED, '800', 'right');
      return;
    }
    panel(34, 220, 425, 228, .96); ctx.fillStyle = GOLD; ctx.fillRect(34, 235, 4, 190);
    label((m.radio ? 'RADIO / ' : 'INCOMING / ') + story.contact, 57, 249, GOLD);
    text(story.name, 57, 284, story.name.length > 22 ? 22 : 27, CREAM, '900');
    text(story.role, 57, 308, 13, MUTED, '700');
    const words = story.dialogue[m.dialogue].split(' '); let line = '', y = 349;
    for (const word of words) { if ((line + word).length > 34) { text(line, 57, y, 20, CREAM, '500'); line = ''; y += 27; } line += word + ' '; }
    text(line, 57, y, 20, CREAM, '500');
    keycap('↵', 57, 424, 27); text(m.dialogue === story.dialogue.length - 1 ? (m.radio ? 'End call' : 'Accept job') : 'Continue conversation', 96, 424, 13, GOLD);
    text(`${m.dialogue + 1} / ${story.dialogue.length}`, 436, 424, 13, MUTED, '700', 'right');
  }
  function trialHud(state) {
    const run = state.trial, seconds = run.course.limit - run.time;
    panel(28, 147, 256, 92, .95);
    text(run.course.name, 42, 174, 20, MINT, '900');
    text(seconds.toFixed(1) + 's', 42, 216, 31, CREAM, '900');
    text('GATE ' + run.gate + ' / ' + (run.course.gates.length - 1), 270, 213, 14, GOLD, '900', 'right');
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
    const rows = [['WASD / ARROWS', 'Walk / accelerate, brake & steer'], ['SHIFT / SPACE', 'Sprint on foot / handbrake in a car'], ['E', 'Enter, steal, exit, talk, use services'], ['MOUSE / CLICK', 'Aim / fire · 1/2/3 weapons · F punch'], ['M / ESC', 'City map / pause'], ['K', 'Save progress anywhere when heat is clear']];
    rows.forEach(([a, b], i) => { text(a, 247, 225 + i * 47, 15, GOLD, '900'); text(b, 470, 225 + i * 47, 16, CREAM, '500'); });
    text('VOLUME', 247, 550, 15, GOLD, '900');
    button('quieter', '−', '', 470, 521, 62); text(Math.round(volume * 100) + '%', 607, 559, 23, CREAM, '900', 'center'); button('louder', '+', '', 680, 521, 62);
    button('resume', 'BACK TO THE BAY', 'ESC →', 247, 626, 352, true);
    if (state.screen === 'pause') button('save', state.heat > 0 ? 'LOSE HEAT TO SAVE' : 'SAVE GAME', 'K →', 632, 626, 352, false, state.heat > 0);
  }
  function completion(state) {
    const m = state.mission;
    panel(338, 28, 505, 114, .96);
    ctx.fillStyle = GOLD; ctx.fillRect(338, 45, 4, 77);
    text('MISSION PASSED', 359, 71, 32, GOLD, '900');
    text(m.lastName, 359, 108, 19, CREAM, '800');
    text('+$' + m.lastPayout.toLocaleString('en-US'), 822, 77, 35, MINT, '900', 'right');
    text('+2 REPUTATION', 822, 107, 13, MINT, '900', 'right');
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
      else if (state.mapOpen) drawMapScreen(p, state, { panel, keycap });
      else {
        drawHud(state);
        if (state.mission.briefing) dialogue(state);
        if (state.shopOpen) shop(state);
        if (state.garageOpen) drawGarageScreen(p, state, { panel, buttons });
        if (state.mission.banner > 0 && state.screen === 'play' && !state.mission.briefing && !state.mapOpen) completion(state);
        if (state.rankNotice?.time > 0 && !state.mission.banner && !state.mapOpen) {
          panel(452, 28, 376, 56, .94);
          text('REPUTATION  /  ' + state.rankNotice.name, 640, 63, 21, GOLD, '900', 'center');
        }
        if (state.screen === 'wasted' || state.screen === 'busted') death(state);
        if (state.screen === 'ending') ending(state);
      }
      if (state.screen === 'pause' || state.settingsOpen) settings(state, volume);
    },
  };
}
