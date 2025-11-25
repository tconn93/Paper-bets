import { create } from 'zustand';

const calculatePotentialWin = (odds, stake) => {
  // Convert American odds to decimal and calculate potential win
  let decimalOdds;
  if (odds > 0) {
    decimalOdds = odds / 100 + 1;
  } else {
    decimalOdds = 100 / Math.abs(odds) + 1;
  }
  return stake * decimalOdds;
};

const createBetKey = (item) => {
  return `${item.game_id}_${item.bet_type}_${item.selected_team}`;
};

const useBetSlipStore = create((set, get) => ({
  items: [],

  addToBetSlip: (item) => {
    set((state) => {
      const itemKey = createBetKey(item);
      const itemWithKey = { ...item, _key: itemKey };

      // Check if item already exists
      const existingIndex = state.items.findIndex((i) => i._key === itemKey);

      if (existingIndex >= 0) {
        // Replace existing item
        const newItems = [...state.items];
        newItems[existingIndex] = itemWithKey;
        return { items: newItems };
      }

      // Add new item
      return { items: [...state.items, itemWithKey] };
    });
  },

  removeFromBetSlip: (key) => {
    set((state) => ({
      items: state.items.filter((item) => item._key !== key),
    }));
  },

  updateStake: (key, stake) => {
    set((state) => ({
      items: state.items.map((item) =>
        item._key === key ? { ...item, stake } : item
      ),
    }));
  },

  clearBetSlip: () => {
    set({ items: [] });
  },

  getTotalStake: () => {
    return get().items.reduce((sum, item) => sum + (item.stake || 0), 0);
  },

  getTotalPotentialWin: () => {
    return get().items.reduce((sum, item) => {
      return sum + calculatePotentialWin(item.odds, item.stake || 0);
    }, 0);
  },
}));

export { useBetSlipStore };