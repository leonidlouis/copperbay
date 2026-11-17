import { ROAD_CENTERS, PLACES, DISTRICTS, districtAt } from './city.js';
import { currentMission, missionTarget, missionObjective, STORY } from './missions.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { clamp, distance, TAU } from './math.js';
const CREAM = '#fff0d5', MUTED = '#a9c3c4', GOLD = '#ffd080', MINT = '#7fe6c7';
export function createHUD(p) {
  const { ctx, text, circle } = p;
  const buttons = [];
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
  function minimap(state, cx = 133, cy = 635, radius = 93, full = false) {
    const player = state.player, target = missionTarget(state);
    const mapScale = full ? radius * 2 / 4300 : .13;
    const centerX = full ? 2050 : player.x, centerY = full ? 2050 : player.y;
    const map = (x, y) => ({ x: cx + (x - centerX) * mapScale, y: cy + (y - centerY) * mapScale });
    ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.clip();
    ctx.fillStyle = '#174b59'; ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    const land = map(190, 190); ctx.fillStyle = '#284d52'; ctx.fillRect(land.x, land.y, 3790 * mapScale, 3790 * mapScale);
    ctx.strokeStyle = '#738d89'; ctx.lineWidth = Math.max(4, 146 * mapScale); ctx.beginPath();
    for (const v of ROAD_CENTERS) { let a = map(v, 190), b = map(v, 3970); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); a = map(190, v); b = map(3970, v); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } ctx.stroke();
    ctx.strokeStyle = '#243d49'; ctx.lineWidth = Math.max(2, 100 * mapScale); ctx.stroke();
    if (target) {
      const t = map(target.x, target.y), a = map(player.x, player.y);
      ctx.strokeStyle = '#f5ce7899'; ctx.lineWidth = full ? 3 : 2; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(t.x, a.y); ctx.lineTo(t.x, t.y); ctx.stroke(); ctx.setLineDash([]);
      const dx = t.x - cx, dy = t.y - cy, d = Math.hypot(dx, dy); const f = Math.min(1, (radius - 10) / (d || 1));
      const x = cx + dx * f, y = cy + dy * f;
      p.poly([{ x, y: y - 6 }, { x: x + 6, y }, { x, y: y + 6 }, { x: x - 6, y }], GOLD, '#fff0d1');
    }
    for (const place of Object.values(PLACES)) { const q = map(place.x, place.y); circle(q.x, q.y, full ? 4 : 2.5, MINT); if (full) text(place.name, q.x + 8, q.y - 5, 9, CREAM); }
    for (const car of state.cars) if (car.police && !car.wreck && state.heat > 0) { const q = map(car.x, car.y); circle(q.x, q.y, full ? 4 : 3.3, Math.floor(state.elapsed * 4) % 2 ? '#ff8089' : '#88c9ff'); }
    const q = map(player.x, player.y);
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(player.angle + Math.PI / 2); p.poly([{ x: 0, y: -8 }, { x: 5, y: 6 }, { x: 0, y: 3 }, { x: -5, y: 6 }], '#ffffff', '#1b424c'); ctx.restore();
    if (full) for (const d of DISTRICTS) { const q = map(d.x, d.y); text(d.tag, q.x, q.y + 25, 11, d.color, '900', 'center'); }
    ctx.restore(); ctx.lineWidth = 4; ctx.strokeStyle = '#d0c9a6'; ctx.beginPath(); ctx.arc(cx, cy, radius + 2, 0, TAU); ctx.stroke();
    text('N', cx, cy - radius + 15, 11, CREAM, '900', 'center');
  }
  function drawHud(state) {
    const pl = state.player, m = state.mission, story = currentMission(state), target = missionTarget(state);
    const gradient = ctx.createLinearGradient(0, 0, 0, 180); gradient.addColorStop(0, '#0d2639c9'); gradient.addColorStop(1, '#0d263900'); ctx.fillStyle = gradient; ctx.fillRect(0, 0, 1280, 180);
    text('COPPER BAY', 30, 66, 43, CREAM, '900', 'left', 'Arial Black, Arial');
    ctx.fillStyle = GOLD; ctx.fillRect(31, 80, 40, 3); label('THE MERIDIAN FILES', 82, 85, GOLD);
    const hour = Math.floor(state.time), minute = Math.floor((state.time % 1) * 60);
    label(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}  /  ${districtAt(pl.x, pl.y).tag}`, 31, 110);
    if (!pl.car) { text('ON FOOT', 31, 156, 29, GOLD, '900'); label('MARA VALE', 32, 177, CREAM); }
    text('$' + Math.floor(pl.money).toLocaleString('en-US'), 1246, 57, 32, MINT, '900', 'right');
    for (let i = 0; i < 5; i++) text('★', 1102 + i * 31, 98, 28, i < Math.ceil(state.heat) ? GOLD : '#54717b', '900', 'center');
    if (state.heat > 0) {
      text(state.unseen > 3 ? 'SEARCHING · STAY OUT OF SIGHT' : 'PURSUIT ACTIVE', 1245, 120, 11, state.unseen > 3 ? MINT : '#ff9b93', '800', 'right');
      ctx.fillStyle = '#244654'; ctx.fillRect(1090, 128, 155, 3); ctx.fillStyle = GOLD; ctx.fillRect(1090, 128, 155 * (1 - Math.min(1, state.unseen / (8 + Math.ceil(state.heat) * 2))), 3);
    }
    panel(1003, 147, 246, 66, .84);
    label(pl.car ? VEHICLE_TYPES[pl.car.type].name : `MARA VALE  /  ${pl.weapon}`, 1016, 167, CREAM);
    const health = pl.car ? clamp(pl.car.hp / VEHICLE_TYPES[pl.car.type].hp, 0, 1) : pl.health / 100;
    ctx.fillStyle = '#48616c'; ctx.fillRect(1017, 178, 168, 6); ctx.fillStyle = MINT; ctx.fillRect(1017, 178, 168 * health, 6);
    ctx.fillStyle = '#48616c'; ctx.fillRect(1017, 189, 168, 4); ctx.fillStyle = '#8abdea'; ctx.fillRect(1017, 189, 168 * pl.armor / 100, 4);
    text(pl.car ? 'HP' : String(pl.ammo), 1233, 190, 19, CREAM, '900', 'right');
    minimap(state);
    const district = districtAt(pl.x, pl.y);
    text(district.tag, 133, 753, 16, CREAM, '900', 'center'); label(district.name, 133 - district.name.length * 3.1, 771, MUTED);
    panel(260, 650, 760, 91, .94);
    ctx.fillStyle = GOLD; ctx.fillRect(260, 660, 4, 71);
    label(m.complete ? 'THE MERIDIAN FILES · COMPLETE' : `${String(Math.min(m.index + 1, 6)).padStart(2, '0')} / ${story.name}`, 280, 674, GOLD);
    const objective = missionObjective(state); text(objective, 280, 708, objective.length > 58 ? 21 : 24, CREAM, '800');
    if (target) text(Math.round(distance(pl, target)) + ' m', 1001, 674, 13, MUTED, '700', 'right');
    if (m.timer > 0) text(`${Math.ceil(m.timer)}s`, 1000, 707, 22, '#ff9d86', '900', 'right');
    const keys = pl.car ? [['WASD', 'drive', 47], ['SPACE', 'handbrake', 55], ['E', 'exit', 25], ['M', 'map', 25], ['ESC', 'pause', 39]] : [['WASD', 'move', 47], ['SHIFT', 'sprint', 47], ['E', 'steal / talk', 25], ['LMB', 'fire', 39], ['F', 'punch', 25], ['M', 'map', 25]];
    let x = 274;
    for (const [key, name, w] of keys) { keycap(key, x, 773, w); text(name, x + w + 7, 773, 12, CREAM, '700'); x += w + name.length * 6 + 27; }
    if (pl.car) {
      panel(1052, 655, 197, 118, .9);
      text(String(Math.round(Math.abs(pl.car.speed) * .23)).padStart(3, '0'), 1070, 717, 53, CREAM, '900'); label('KM/H', 1199, 715, MUTED);
      const v = Math.abs(pl.car.speed) / VEHICLE_TYPES[pl.car.type].max;
      for (let i = 0; i < 14; i++) { ctx.fillStyle = i / 14 < v ? i > 10 ? '#ff967a' : MINT : '#2b4b58'; ctx.fillRect(1071 + i * 11, 737 - i * .5, 7, 15 + i * .5); }
    }
    if (state.saved > 0) label('✓ LOCAL SAVE', 1146, 236, MINT);
    if (state.toast.time > 0 && !m.briefing) {
      const w = Math.min(760, state.toast.text.length * 7 + 40); panel(640 - w / 2, 139, w, 38, .86); text(state.toast.text, 640, 164, 13, CREAM, '700', 'center');
    }
    if (!pl.car && !m.briefing && !state.shopOpen) {
      let prompt = '';
      if (!m.active && target && distance(pl, target) < 120) prompt = 'E   TALK TO ' + story.contact;
      else if (state.cars.some(c => !c.wreck && distance(c, pl) < 90)) prompt = 'E   ENTER / STEAL CAR';
      if (prompt) { panel(499, 551, 282, 40, .9); text(prompt, 640, 577, 15, GOLD, '900', 'center'); }
    }
  }
  function dialogue(state) {
    const story = currentMission(state), m = state.mission;
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
  function cityMap(state) {
    ctx.fillStyle = '#0b2438c9'; ctx.fillRect(0, 0, 1280, 800); panel(98, 40, 1084, 720, .97);
    text('THE CITY IS YOURS.', 139, 105, 38, CREAM, '900'); label('COPPER BAY / CITY MAP', 140, 132, GOLD);
    minimap(state, 474, 432, 260, true);
    text('FOUR DISTRICTS.', 792, 222, 24, CREAM, '900');
    DISTRICTS.forEach((d, i) => { text(String(i + 1).padStart(2, '0'), 795, 270 + i * 59, 15, d.color, '900'); text(d.name, 829, 270 + i * 59, 17, CREAM, '900'); label(d.tag, 829, 290 + i * 59); });
    text('◆  Active mission', 795, 551, 16, GOLD); text('●  Shop / safehouse', 795, 582, 16, MINT); text('●  Police patrol', 795, 613, 16, '#87bded');
    text('M / ESC   BACK TO THE STREETS', 139, 727, 14, GOLD, '900');
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
      else {
        drawHud(state);
        if (state.mission.briefing) dialogue(state);
        if (state.mapOpen) cityMap(state);
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
