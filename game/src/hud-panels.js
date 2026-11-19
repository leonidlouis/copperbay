import { currentMission, missionTarget, missionObjective } from './missions.js';
import { districtAt } from './city.js';
import { VEHICLE_TYPES } from './vehicles.js';
import { distance, clamp } from './math.js';
import { CREAM, MUTED, GOLD, MINT, RED } from './ui.js';
import { drawMinimap } from './map-screen.js';
const clock = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
export function drawHUD(ui, state) {
  const { ctx, text, label, panel, bar, wrap } = ui, p = state.player, m = state.mission, story = currentMission(state), car = p.car;
  const g = ctx.createLinearGradient(0, 0, 0, 118); g.addColorStop(0, '#0b354a75'); g.addColorStop(1, '#0b354a00'); ctx.fillStyle = g; ctx.fillRect(0, 0, 1280, 118);
  text('COPPER BAY', 25, 49, 31, CREAM, '900', 'left', 'Arial Black, Arial');
  label('THE MERIDIAN FILES', 27, 69, GOLD, 10); ctx.fillStyle = GOLD; ctx.fillRect(27, 80, 43, 2); ctx.fillStyle = '#ffe2ab44'; ctx.fillRect(70, 80, 126, 2);
  panel(484, 24, 312, 35, .7); text(`${districtAt(p.x, p.y).name}  /  ${String(Math.floor(state.time)).padStart(2,'0')}:${String(Math.floor(state.time % 1 * 60)).padStart(2,'0')}`, 640, 46, 11, CREAM, '800', 'center');
  text('$' + Math.floor(p.money).toLocaleString('en-US'), 1252, 49, 31, MINT, '900', 'right');
  for (let i = 0; i < 5; i++) text('★', 1117 + i * 30, 88, 28, i < Math.ceil(state.heat) ? GOLD : '#66878966', '900', 'center');
  text(state.heat ? (state.unseen > 3 ? 'SEARCHING / BREAK LINE OF SIGHT' : 'WANTED / PURSUIT AUTHORIZED') : 'OFF THE RADAR / FREE ROAM', 1252, 111, 10, state.heat ? RED : MINT, '800', 'right');
  panel(24, 103, 345, 176);
  label(`CHAPTER ${String(Math.min(6, m.index + 1)).padStart(2,'0')} / 06   •   ${story.name}`, 40, 125, GOLD, 10);
  wrap(missionObjective(state), 40, 154, 308, 20, CREAM, 25);
  const count = story.steps.length, progress = m.active ? (m.step + .45) / count : 0;
  label(`STAGE ${String(m.step + 1).padStart(2,'0')} / ${String(count).padStart(2,'0')}`, 40, 210, MINT);
  text(clock(m.timer > 0 ? m.timer : m.elapsed || 0), 352, 211, 19, GOLD, '900', 'right');
  bar(40, 221, 312, progress, GOLD, 4);
  label(m.timer > 0 ? 'TIME LEFT' : 'ELAPSED', 300, 238, MUTED, 8);
  label('NEXT', 40, 251, GOLD, 9); const next = story.steps[m.step + 1]?.text || 'Close the chapter. Collect your reward.';
  wrap(next, 80, 251, 269, 11, MUTED, 14);
  const slots = [['1','PISTOL',p.ammo],['2','UNARMED','∞'],['3','SCATTERGUN',p.shotgun ? p.ammo : 'LOCK']];
  slots.forEach(([key,name,ammo], i) => {
    const x = 24 + i * 117, active = p.weapon === (i === 1 ? 'FISTS' : name); panel(x, 291, 111, 51, .9);
    if (active) { ctx.fillStyle = GOLD; ctx.fillRect(x, 296, 2, 40); }
    label(key, x + 9, 306, GOLD, 10); label(name, x + 9, 331, CREAM, 8);
    if (i !== 1) { ctx.fillStyle = CREAM; ctx.fillRect(x + 35, 303, i === 2 ? 36 : 26, 5); ctx.fillRect(x + 37, 307, 7, 8); }
    else { ctx.fillStyle = MUTED; ctx.fillRect(x + 44, 300, 12, 12); ctx.fillRect(x + 40, 306, 9, 8); }
    text(String(ammo), x + 102, 314, 10, MUTED, '800', 'right');
  });
  panel(1009, 130, 245, 181, .95); label('POLICE RESPONSE', 1025, 152, CREAM, 11); label(state.heat ? 'LIVE' : 'CLEAR', 1211, 152, state.heat ? RED : MINT, 8);
  bar(1025, 162, 212, 1, state.heat ? RED : MINT, 1);
  const units = state.cars.filter(c => c.police && !c.wreck).sort((a,b) => distance(a,p) - distance(b,p)).slice(0,3);
  if (!state.heat || !units.length) { label('NO ACTIVE DISPATCH', 1025, 194, MINT); label('Keep it quiet out there, Mara.', 1025, 220); }
  else units.forEach((c,i) => {
    const d = Math.round(distance(c,p)), status = c.parked ? 'ROADBLOCK' : d < 110 ? 'RAMMING' : i === 1 ? 'PURSUIT' : 'INTERCEPT';
    label('UNIT ' + String(9 + i * 3).padStart(2,'0'), 1025, 187 + i * 27, MUTED, 9);
    label(status, 1093, 187 + i * 27, i === 0 ? RED : GOLD, 9);
    text(d + ' m', 1236, 187 + i * 27, 10, CREAM, '800', 'right');
  });
  label(state.heat >= 3 ? 'AIR 01' : 'DISPATCH', 1025, 282, MUTED, 9); label(state.heat >= 3 ? 'TRACKING ABOVE' : state.heat ? 'GROUND UNITS ACTIVE' : 'STREETS ARE CLEAR', 1085, 282, MINT, 9);
  bar(1025, 294, 212, state.heat ? 1 - clamp(state.unseen / 20,0,1) : 1, state.heat ? RED : MINT, 3);
  drawMinimap(ui, state, 126, 641, 88);
  panel(24, 739, 205, 57); text(districtAt(p.x,p.y).tag, 126, 755, 13, CREAM, '900', 'center');
  [['HEALTH',p.health / 100,MINT],['ARMOUR',p.armor / 100,'#8bcbe6'],['RESPECT',Math.min(1,.12 + state.stats.missions * .12 + state.stats.takedowns * .008),GOLD]].forEach(([s,v,c],i) => { label(s, 30, 768 + i * 10, c, 7); bar(83, 762 + i * 10, 133, v, c, 4); });
  if (!m.briefing) {
    panel(249, 681, 256, 95, .9); label('◉  FREE BAY RADIO / 88.4 FM', 265, 703, MINT, 10); text('SALT IN THE SIGNAL', 265, 728, 17, CREAM, '900'); label('SOL NAVARRO  •  COASTAL ELECTRO', 265, 748, MUTED, 8);
    for (let i = 0; i < 15; i++) { const h = 3 + (Math.sin(i * 1.8 + state.elapsed * 3) + 1) * 7; ctx.fillStyle = '#83dbbe99'; ctx.fillRect(266 + i * 5, 762 - h / 2, 2, h); }
    label('NOW PLAYING', 384, 765, GOLD, 8);
  }
  const target = missionTarget(state); panel(526, 696, 473, 38, .9);
  text(target ? `◆ ${Math.round(distance(p,target))} m    /    FOLLOW THE GOLD ROUTE` : '◆  LOSE THE HEAT  /  BREAK LINE OF SIGHT', 762, 720, 12, GOLD, '900', 'center');
  panel(526, 747, 473, 35, .9); text(car ? 'WASD drive   SPACE drift   SHIFT nitro   E exit' : 'WASD move   SHIFT sprint   LMB fire   E steal', 762, 769, 11, CREAM, '800', 'center');
  text(`V  ${state.viewMode === 'iso' ? 'CHASE CAMERA' : 'ISOMETRIC'}    M  MAP    K  SAVE    ${car ? 'G  GARAGE' : 'Q / R  ORBIT'}`, 540, 796, 9, MUTED, '800');
  panel(1032, 646, 222, 136, .94);
  label(car ? VEHICLE_TYPES[car.type].name : 'MARA VALE / ON FOOT', 1048, 666, GOLD, 10);
  if (car) {
    const speed = Math.round(Math.abs(car.speed) * .23); text(String(speed).padStart(3,'0'), 1048, 722, 54, CREAM, '900'); text('D' + Math.max(1,Math.min(6, Math.ceil(speed / 24))), 1235, 690, 16, MINT, '900', 'right'); label('KM/H', 1182, 721, MUTED, 9);
    label('CONDITION',1048,742,MUTED,8); bar(1116,737,120,car.hp / VEHICLE_TYPES[car.type].hp,MINT,5);
    label('NITRO',1048,764,'#8bd5f2',8); bar(1116,759,120,(state.upgrades.nitro ? car.nitro ?? 100 : 0) / 100,'#8bd5f2',5);
  } else { text(p.weapon, 1048, 697, 20, CREAM, '900'); label('ROUNDS',1048,754); text(String(p.ammo).padStart(3,'0'),1236,755,32,CREAM,'900','right'); }
  if (state.combo?.time > 0) { text('+' + state.combo.score, 865, 401, 38, GOLD, '900', 'center'); text(state.combo.label + '  × ' + state.combo.multiplier.toFixed(1), 865, 425, 13, CREAM, '900', 'center'); bar(805,438,120,state.combo.time / 3,GOLD,3); }
  if (state.saved > 0) label('✓ PROGRESS SAVED', 1108, 333, MINT, 9);
  if (state.toast.time > 0 && !m.briefing) { panel(428, 82, 551, 33, .9); text(state.toast.text, 703, 103, 11, CREAM, '700', 'center'); }
  if (!car && !m.briefing && !state.shopOpen) {
    let prompt = '';
    if (!m.active && target && distance(p,target) < 120) prompt = 'E  /  TALK TO ' + story.contact;
    else if (state.cars.some(c => !c.wreck && distance(c,p) < 90)) prompt = 'E  /  ENTER OR STEAL VEHICLE';
    if (prompt) { panel(488, 507, 304, 32, .86); text(prompt,640,528,12,GOLD,'800','center'); }
  }
}
export function drawDialogue(ui, state) {
  const { ctx, text, panel, label, wrap } = ui, story = currentMission(state), m = state.mission;
  panel(249, 552, 750, 126, .97);
  const x = 264, y = 567; ctx.fillStyle = '#56868a'; ctx.beginPath(); ctx.roundRect(x, y, 83, 95, 5); ctx.fill();
  // Original vector portrait of Inez Rook, lit by the dashboard radio.
  ui.poly([{x:x+6,y:y+94},{x:x+18,y:y+67},{x:x+62,y:y+67},{x:x+77,y:y+94}], '#163f4d');
  ui.poly([{x:x+19,y:y+67},{x:x+36,y:y+61},{x:x+43,y:y+78},{x:x+52,y:y+61},{x:x+65,y:y+70},{x:x+61,y:y+95},{x:x+24,y:y+95}], '#70d8bd');
  ctx.fillStyle = '#60493c'; ctx.beginPath(); ctx.ellipse(x+42,y+40,26,34,0,0,Math.PI*2); ctx.fill();
  ui.poly([{x:x+23,y:y+30},{x:x+43,y:y+19},{x:x+62,y:y+33},{x:x+57,y:y+58},{x:x+43,y:y+70},{x:x+29,y:y+56}], '#dbab82');
  ui.poly([{x:x+21,y:y+34},{x:x+27,y:y+16},{x:x+44,y:y+9},{x:x+61,y:y+24},{x:x+65,y:y+40},{x:x+45,y:y+22},{x:x+29,y:y+30}], '#5c4437');
  ctx.fillStyle = '#443c35'; ctx.fillRect(x+30,y+39,8,2); ctx.fillRect(x+48,y+39,8,2); ctx.fillStyle = '#b67d5d'; ctx.fillRect(x+41,y+40,2,11); ctx.fillRect(x+37,y+57,12,1.5);
  ui.circle(x+62,y+48,2.4,GOLD); label((m.radio ? 'RADIO LINK / ' : 'CONTACT / ') + story.contact, 365, 578, GOLD, 11);
  label(story.contact === 'INEZ ROOK' ? 'MECHANIC / CREW CONTACT' : story.role.toUpperCase(),365,598,MINT,9);
  wrap('“' + story.dialogue[Math.min(m.dialogue, story.dialogue.length - 1)] + '”',365,630,610,18,CREAM,22);
  label(`ENTER  CONTINUE  /  ${m.dialogue + 1} OF ${story.dialogue.length}`,365,663,MUTED,8);
}
