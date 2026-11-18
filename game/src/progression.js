// Reputation is earned by story jobs and street races, persisted with the save.
export const RANKS = [
  { xp: 0, name: 'RUNNER', unlock: 'Pistol · Cavell XR' },
  { xp: 300, name: 'WHEELMAN', unlock: 'Stage II engine · +20% acceleration' },
  { xp: 900, name: 'OPERATOR', unlock: 'Reinforced chassis · +80 durability' },
  { xp: 1800, name: 'BAY LEGEND', unlock: 'Scattergun · 30 complimentary rounds' },
];
export function reputation(state) {
  const xp = state.progression.xp;
  const level = RANKS.reduce((n, r, i) => xp >= r.xp ? i : n, 0);
  return { ...RANKS[level], level, total: xp, next: RANKS[level + 1]?.xp || 2400 };
}
export function awardReputation(state, amount) {
  const before = reputation(state).level;
  state.progression.xp += amount;
  const after = reputation(state);
  if (after.level > before) {
    state.progression.announcement = `RANK UP · ${after.name} · ${after.unlock}`;
    state.progression.banner = 8;
    if (after.level >= 3 && !state.player.shotgun) { state.player.shotgun = true; state.player.ammo += 30; }
  }
}
