const SAVE_KEY = 'copper-bay.save.v1';
const SETTINGS_KEY = 'copper-bay.settings.v1';
export function readSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); return s?.version === 1 ? s : null; } catch { return null; } }
export function writeSave(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, x: state.player.x, y: state.player.y, money: state.player.money, armor: state.player.armor, ammo: state.player.ammo, shotgun: state.player.shotgun, mission: state.mission.index, time: state.time, stats: state.stats, progression: state.progression }));
    state.saved = 3; return true;
  } catch { state.toast = { text: 'Storage unavailable — progress stays in this session', time: 4 }; return false; }
}
export function readSettings() { try { return JSON.parse(localStorage.getItem(SETTINGS_KEY)) || { volume: .32 }; } catch { return { volume: .32 }; } }
export function saveSettings(settings) { try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch {} }
