import { create } from 'zustand';
import type { BetSlipItem } from '../types';

interface BetSlipState {
  items: BetSlipItem[];
  addToBetSlip: (item: BetSlipItem) => void;
  removeFromBetSlip: (oddId: string) => void;
  updateStake: (oddId: string, stake: number) => void;
  clearBetSlip: () => void;
  getTotalStake: () => number;
  getTotalPotentialWin: () => number;
}

export const useBetSlipStore = create<BetSlipState>((set, get) => ({
  items: [],

  addToBetSlip: (item) => {
    set((state) => {
      // Check if item already exists
      const exists = state.items.some((i) => i.oddId === item.oddId);
      if (exists) {
        // Replace existing item
        return {
          items: state.items.map((i) =>
            i.oddId === item.oddId ? item : i
          ),
        };
      }
      // Add new item
      return { items: [...state.items, item] };
    });
  },

  removeFromBetSlip: (oddId) => {
    set((state) => ({
      items: state.items.filter((item) => item.oddId !== oddId),
    }));
  },

  updateStake: (oddId, stake) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.oddId === oddId ? { ...item, stake } : item
      ),
    }));
  },

  clearBetSlip: () => {
    set({ items: [] });
  },

  getTotalStake: () => {
    return get().items.reduce((sum, item) => sum + item.stake, 0);
  },

  getTotalPotentialWin: () => {
    return get().items.reduce((sum, item) => sum + item.stake * item.odds, 0);
  },
}));
