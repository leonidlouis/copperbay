import { BEACH_EDGE, DISTRICTS, PLACES, ROAD_CENTERS } from './city.js';
import { missionTarget, STORY } from './missions.js';
import { TRIALS } from './activities.js';
import { GARAGE_CARS, REPUTATION_RANKS, reputationRank } from './progression.js';
import { VEHICLE_TYPES } from './vehicles.js';

const INK = '#172f37', WATER = '#5aada8', GOLD = '#ffc67d', CREAM = '#fff1d7', MINT = '#a7e7ce';
const SERVICE = '#19796c', STORY_COLOR = '#af502d', TRIAL_COLOR = '#4e629a';

function mapPin(p, x, y, glyph, color) {
  p.circle(x, y, 11, '#fff0cf');
  p.circle(x, y, 9, color);
  p.text(glyph, x, y + 4, 12, '#fff6db', '900', 'center');
}

export function drawMapScreen(p, state, ui) {
  const { ctx, text, poly } = p;
  const { panel, keycap } = ui;
  const mapX = 44, mapY = 115, mapSize = 606, scale = mapSize / 4370;
  const x0 = -240, y0 = -160;
  const at = (x, y) => ({ x: mapX + (x - x0) * scale, y: mapY + (y - y0) * scale });
  const rect = (x, y, w, d, color) => {
    const q = at(x, y); ctx.fillStyle = color; ctx.fillRect(q.x, q.y, w * scale, d * scale);
  };
  ctx.fillStyle = '#142c3c4d'; ctx.fillRect(0, 0, 1280, 800);
  panel(25, 25, 1009, 750, .97);
  text('COPPER BAY', 44, 79, 40, CREAM, '900', 'left', 'Arial Black, Arial');
  text('CITY MAP', 330, 79, 26, GOLD, '800');
  keycap('M', 606, 79, 25, true);
  text('BACK', 638, 79, 11, CREAM, '900');

  ctx.save();
  ctx.beginPath(); ctx.roundRect(mapX, mapY, mapSize, mapSize, 6); ctx.clip();
  ctx.fillStyle = WATER; ctx.fillRect(mapX, mapY, mapSize, mapSize);
  for (let i = 0; i < 26; i++) rect(x0, y0 + i * 175, 4370, 2, '#b9e3c15f');
  rect(187, 190, 3793, 3790, '#d6b69b');
  rect(190, 260, 610, 2180, '#ecc18b');
  rect(BEACH_EDGE, 245, 190 - BEACH_EDGE, 2225, '#f4cc94');
  rect(800, 190, 1840, 1310, '#e7b0a2');
  rect(2640, 190, 1340, 1310, '#bdc69b');
  rect(190, 1500, 3790, 1260, '#ddd0af');
  rect(190, 1500, 610, 940, '#ecc18b');
  rect(-84, 2680, 4064, 1300, '#c7b596');
  for (let y = 2740; y <= 3530; y += 260) rect(-238, y, 186, 76, '#d8c8aa');

  for (const road of ROAD_CENTERS) {
    rect(road - 74, 205, 148, 3730, '#f7e7c8');
    rect(205, road - 74, 3730, 148, '#f7e7c8');
  }
  for (const block of state.city.buildings) rect(block.x, block.y, block.w, block.d, '#715e5b61');
  for (const park of state.city.parks) rect(park.x, park.y, park.w, park.d, '#96a06f');
  for (const d of DISTRICTS) {
    const q = at(d.x, d.y);
    const offset = { 'THE DOCKS': 66, 'THE WATERFRONT': 17, 'THE HILLS': -26, DOWNTOWN: -20 };
    const y = q.y + (offset[d.tag] ?? 22);
    if (d.tag === 'THE WATERFRONT') {
      ctx.save(); ctx.translate(q.x - 17, y); ctx.rotate(-Math.PI / 2);
      text(d.name, 0, 0, 16, INK, '900', 'center'); ctx.restore();
    } else text(d.name, q.x, y, 16, INK, '900', 'center');
  }

  const target = missionTarget(state), player = at(state.player.x, state.player.y);
  if (target) {
    const q = at(target.x, target.y);
    ctx.strokeStyle = '#c96b44'; ctx.lineWidth = 3; ctx.setLineDash([7, 5]);
    ctx.beginPath(); ctx.moveTo(player.x, player.y); ctx.lineTo(q.x, player.y); ctx.lineTo(q.x, q.y); ctx.stroke();
    ctx.setLineDash([]);
  }
  for (const place of Object.values(PLACES)) {
    const q = at(place.x, place.y);
    if (target && Math.hypot(target.x - place.x, target.y - place.y) < 117) continue;
    mapPin(p, q.x, q.y, place.icon, SERVICE);
    if (['G', '+', 'H'].includes(place.icon)) text(place.name, q.x + 15, q.y - 11, 11, INK, '900');
  }
  for (const trial of TRIALS) {
    const q = at(trial.gates[0].x, trial.gates[0].y);
    mapPin(p, q.x, q.y, '⚑', TRIAL_COLOR);
    text(trial.name, q.x + 15, q.y + 5, 12, INK, '900');
  }
  if (target) {
    const q = at(target.x, target.y);
    mapPin(p, q.x, q.y, '◆', STORY_COLOR);
    text('CURRENT JOB', q.x + 15, q.y + 5, 12, STORY_COLOR, '900');
  }
  p.circle(player.x, player.y, 11, '#ffefd0');
  poly([{ x: player.x, y: player.y - 8 }, { x: player.x + 6, y: player.y + 5 }, { x: player.x, y: player.y + 2 }, { x: player.x - 6, y: player.y + 5 }], INK);
  text('N', 620, 146, 14, INK, '900', 'center');
  poly([{ x: 620, y: 152 }, { x: 626, y: 168 }, { x: 620, y: 165 }, { x: 614, y: 168 }], INK);
  ctx.restore();

  for (const [x, glyph, color, label] of [[57, '◆', STORY_COLOR, 'STORY JOB'], [198, '+', SERVICE, 'SERVICES'], [336, 'G', SERVICE, 'GARAGE'], [469, '⚑', TRIAL_COLOR, 'TIME TRIALS']]) {
    mapPin(p, x, 747, glyph, color);
    text(label, x + 17, 752, 13, CREAM, '800');
  }
  drawProgressionPanel(p, state, ui);
}

function drawProgressionPanel(p, state, { panel }) {
  const { ctx, text } = p;
  const x = 680, right = 1005, profile = state.progression;
  const rank = reputationRank(profile.rep);
  panel(x - 12, 104, 347, 620, .82);
  text('MARA VALE', x, 138, 22, CREAM, '900');
  text('$' + state.player.money.toLocaleString('en-US'), right, 139, 29, MINT, '900', 'right');
  text(rank.name, x, 182, 35, GOLD, '900');
  text(profile.rep + ' REP', right, 182, 18, CREAM, '900', 'right');
  const next = REPUTATION_RANKS.find(r => r.at > profile.rep);
  const progress = next ? (profile.rep - rank.at) / (next.at - rank.at) : 1;
  ctx.fillStyle = '#38545a'; ctx.fillRect(x, 197, 325, 6);
  ctx.fillStyle = '#f3ae72'; ctx.fillRect(x, 197, 325 * progress, 6);
  text(next ? `NEXT · ${next.name} AT ${next.at} REP` : 'MAXIMUM REPUTATION', x, 223, 13, '#c9d9ce', '800');

  const chapter = Math.min(state.mission.index + 1, STORY.length);
  text(`STORY  ${chapter} / ${STORY.length}`, x, 271, 18, GOLD, '900');
  text(STORY[chapter - 1].name, x, 297, 18, CREAM, '800');
  text('LOADOUT', x, 343, 18, GOLD, '900');
  text(state.player.shotgun ? 'Pistol  /  Scattergun' : 'Pistol', x, 371, 18, CREAM, '700');
  text('GARAGE', x, 421, 18, GOLD, '900');
  GARAGE_CARS.forEach((car, i) => {
    const y = 449 + i * 33;
    const owned = profile.unlockedCars.includes(car.type), unlocked = profile.rep >= car.rep;
    text(VEHICLE_TYPES[car.type].name, x, y, 17, CREAM, '800');
    text(owned ? 'OWNED' : unlocked ? 'AVAILABLE' : car.rep + ' REP', right, y, 14, owned || unlocked ? MINT : '#c4ccbe', '800', 'right');
  });
  text('TIME TRIAL RECORDS', x, 574, 18, GOLD, '900');
  TRIALS.forEach((trial, i) => {
    const y = 605 + i * 34;
    text(trial.name, x, y, 16, CREAM, '800');
    const record = profile.records[trial.id];
    text(record ? record.toFixed(1) + 's' : '—', right, y, 17, MINT, '800', 'right');
  });
  if (profile.tune) text('✓ STREET TUNE INSTALLED', x, 691, 14, MINT, '800');
}
