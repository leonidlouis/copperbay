export const REPUTATION_RANKS = [
  { name: 'NEW FACE', at: 0 },
  { name: 'LOCAL', at: 2 },
  { name: 'FIXER', at: 5 },
  { name: 'WHEEL ACE', at: 9 },
  { name: 'BAY LEGEND', at: 14 },
];

export const GARAGE_CARS = [
  { type: 'coupe', rep: 0, price: 0, color: '#ed6c48' },
  { type: 'mistral', rep: 5, price: 950, color: '#42a6a3' },
  { type: 'caldera', rep: 9, price: 1450, color: '#e0af56' },
];

export function createProgression(save) {
  const old = save?.progression;
  return {
    rep: old?.rep ?? (save?.mission ?? 0) * 2,
    records: { ...old?.records },
    unlockedCars: [...(old?.unlockedCars ?? ['coupe'])],
    tune: !!old?.tune,
  };
}

export function reputationRank(rep) {
  return REPUTATION_RANKS.findLast(rank => rank.at <= rep) ?? REPUTATION_RANKS[0];
}

export function awardReputation(state, amount) {
  const oldRank = reputationRank(state.progression.rep);
  state.progression.rep += amount;
  const rank = reputationRank(state.progression.rep);
  if (oldRank !== rank) state.rankNotice = { name: rank.name, time: 6 };
}
